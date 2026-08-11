import io
import json
import os
import unittest
import urllib.error
from email.message import Message
from unittest.mock import patch

from build_fast_multithreaded_real_stats import (
    fetch_github_repositories,
    get_country_rotation,
    github_api_get,
    github_graphql,
    select_country_batch,
)


class GithubApiGetTests(unittest.TestCase):
    def test_rate_limit_aborts_without_sleeping_until_reset(self):
        headers = Message()
        headers["X-RateLimit-Remaining"] = "0"
        headers["X-RateLimit-Reset"] = "4102444800"
        error = urllib.error.HTTPError(
            "https://api.github.com/users/example",
            403,
            "Forbidden",
            headers,
            io.BytesIO(b'{"message":"API rate limit exceeded"}'),
        )

        with patch.dict(os.environ, {"GIT_TOKEN": "test-token"}), patch(
            "build_fast_multithreaded_real_stats.urllib.request.urlopen",
            side_effect=error,
        ), patch("build_fast_multithreaded_real_stats.time.sleep") as sleep:
            with self.assertRaisesRegex(RuntimeError, "rate limit reached; aborting"):
                github_api_get("/users/example")

        sleep.assert_not_called()


class CountryRotationTests(unittest.TestCase):
    def test_four_batches_cover_every_country_once(self):
        next_country = None
        processed = []
        batch_sizes = []

        for _ in range(4):
            batch, next_country, _ = select_country_batch(next_country, 20)
            processed.extend(batch)
            batch_sizes.append(len(batch))

        rotation = get_country_rotation()
        self.assertEqual(batch_sizes, [20, 20, 20, 12])
        self.assertEqual(processed, rotation)
        self.assertEqual(len(processed), len(set(processed)))
        self.assertEqual(next_country, rotation[0])

    def test_first_batch_interleaves_high_activity_regions(self):
        batch, next_country, cycle_completed = select_country_batch(batch_size=20)

        self.assertTrue({
            "United States", "China", "Brazil", "India", "South Korea",
            "Philippines", "Colombia", "Japan",
        }.issubset(batch))
        self.assertEqual(next_country, "Indonesia")
        self.assertFalse(cycle_completed)

    @patch("build_fast_multithreaded_real_stats.github_graphql")
    def test_repository_metrics_limit_graphql_pagination(self, graphql):
        graphql.side_effect = [
            {
                "user": {
                    "repositories": {
                        "nodes": [{
                            "isFork": False,
                            "stargazerCount": 8,
                            "primaryLanguage": {"name": "Python"},
                        }],
                        "pageInfo": {"hasNextPage": True, "endCursor": "next"},
                    }
                }
            },
            {
                "user": {
                    "repositories": {
                        "nodes": [{
                            "isFork": True,
                            "stargazerCount": 3,
                            "primaryLanguage": None,
                        }],
                        "pageInfo": {"hasNextPage": False, "endCursor": None},
                    }
                }
            },
        ]

        repositories = fetch_github_repositories("example")

        self.assertEqual(
            repositories,
            [{"fork": False, "stargazers_count": 8, "language": "Python"}],
        )
        self.assertEqual(graphql.call_count, 1)
        self.assertEqual(graphql.call_args_list[0].args[1]["cursor"], None)

    def test_graphql_rate_limit_aborts_without_sleeping_until_reset(self):
        response = io.BytesIO(json.dumps({
            "data": None,
            "errors": [{"type": "RATE_LIMITED", "message": "rate limit exceeded"}],
        }).encode())

        with patch.dict(os.environ, {"GIT_TOKEN": "test-token"}), patch(
            "build_fast_multithreaded_real_stats.urllib.request.urlopen",
            return_value=response,
        ), patch("build_fast_multithreaded_real_stats.time.sleep") as sleep:
            with self.assertRaisesRegex(RuntimeError, "GraphQL rate limit reached; aborting"):
                github_graphql("query { viewer { login } }", {})

        sleep.assert_not_called()


if __name__ == "__main__":
    unittest.main()
