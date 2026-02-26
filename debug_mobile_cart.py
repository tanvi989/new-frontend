#!/usr/bin/env python3
"""
Debug the exact content of the mobile cart file
"""

with open(r"C:\Users\User\Desktop\multifolks\25morning\new-frontend\components\cart\MobileCart.tsx", 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Show lines 569-574 with character details
for i, line in enumerate(lines[568:574], 569):
    print(f"Line {i}:")
    print(f"  Raw: {repr(line)}")
    print(f"  Visible: {line.rstrip()}")
    print()
