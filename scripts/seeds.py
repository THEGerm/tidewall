"""The 9 study triple seeds (#38), derived from a public drand beacon round so
anyone can check them and nobody could pick them.

    python3 scripts/seeds.py

Checks the round's randomness against docs/seeds.md and prints the seeds.
Verify the round itself at https://api.drand.sh/public/6601923.
"""

import hashlib

ROUND = 6601923  # drand mainnet (default chain), 2026-10-31 23:18:30 UTC
RANDOMNESS = "c3fb557f04a5bed65d293f38fe29b2cb4740fdfb4770a800bad400f398bcc6e8"


def seed(triple: int) -> str:
    return hashlib.sha256(f"{RANDOMNESS}:tidewall-triple-{triple}".encode()).hexdigest()[:16]


if __name__ == "__main__":
    for n in range(1, 10):
        print(n, seed(n))
