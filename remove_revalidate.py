#!/usr/bin/env python3
import os
import re

base_paths = [
    '/Users/mac/Documents/Omko/omko/En produccion/Web-omko/pages',
    '/Users/mac/Documents/Omko/omko/En produccion/Web-omko-production/pages',
]

dynamic_files = [
    'properties/categories/[slug].jsx',
    'properties/city/[slug].jsx',
    'properties-details/[slug].jsx',
    'project-details/[slug].jsx',
    'agent-details/[slug].jsx',
    'article-details/[slug].jsx',
    'payment/[slug].jsx',
    'user/edit-property/[slug].jsx',
    'user/edit-project/[slug].jsx',
    'user/intrested/[slug].jsx',
]

for base_path in base_paths:
    for file in dynamic_files:
        filepath = os.path.join(base_path, file)
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Remove revalidate lines (both fallback and notFound cases)
            content = re.sub(r',\s*revalidate:\s*\d+', '', content)
            content = re.sub(r',\s*revalidate:\s*false', '', content)
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"✓ Fixed: {base_path.split('/')[-2]}/pages/{file}")

print("\nAll revalidate removed!")
