import random
from typing import List
from .transforms.basic import (
    leetspeak, random_case, insert_whitespace, insert_symbols,
    to_base64, to_rot13, reverse_text
)

class MutationEngine:
    def __init__(self):
        self.strategies = [
            ("leetspeak", lambda t: leetspeak(t, intensity=random.uniform(0.3, 0.8))),
            ("random_case", lambda t: random_case(t, intensity=random.uniform(0.3, 0.7))),
            ("whitespace", lambda t: insert_whitespace(t, frequency=random.uniform(0.1, 0.4))),
            ("symbols", lambda t: insert_symbols(t, frequency=random.uniform(0.1, 0.3))),
            # Add more complex ones later
        ]

    def mutate(self, text: str, count: int = 10, strategies: List[str] = None) -> List[dict]:
        results = []
        attempts = 0
        max_attempts = count * 5 # Avoid infinite loops

        while len(results) < count and attempts < max_attempts:
            attempts += 1
            current_text = text
            applied = []
            
            # Apply 1-3 random strategies
            num_transforms = random.randint(1, 3)
            chosen_strategies = random.sample(self.strategies, num_transforms)
            
            for name, func in chosen_strategies:
                if strategies and name not in strategies:
                    continue
                try:
                    current_text = func(current_text)
                    applied.append(name)
                except:
                    pass
            
            if current_text != text and applied:
                results.append({
                    "output": current_text,
                    "strategies": applied,
                })
        
        return results[:count]

fuzzer = MutationEngine()

