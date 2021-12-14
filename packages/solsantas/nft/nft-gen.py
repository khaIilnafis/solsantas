import sys
from shutil import copyfile
import json

metadata = {"name": "Secret Santas on Sol #0",
            "symbol": "SSoS",
            "description": "SSoS",
            "seller_fee_basis_points": 500,
            "image": "image.png",
            "external_url": "https://solsantas.xyz",
            "attributes": [
                {
                    "trait_type": "Year",
                    "value": "2021"
                }
            ],
            "collection": {
                "name": "Secret Santas on Sol",
                "family": "Secret Santas on Sol"
            },
            "properties": {
                "files": [
                    {
                        "uri": "image.png",
                        "type": "image/png"
                    }
                ],
                "category": "image",
                "creators": [
                    {
                        "address": "74oMvuZctGXRcTXptBAjhgzA7VJFjY7w5Fp3CYgysWA3",
                        "share": 100
                    }
                ]
            }}
def iterate_metadata(iteration):
    new_metadata = metadata
    new_metadata['name'] = new_metadata['name'].replace(new_metadata['name'],f'Secret Santas on Sol #{str(iteration)}',1)
    return new_metadata

def main(args):
    count = int(args[0])
    for num in range(count):
        updated_metadata = iterate_metadata(num)
        f = open(f'./assets/{num}.json','w')
        f.write(json.dumps(updated_metadata))
        f.close()
        copyfile('SOL_Santas_WIP_ROUGH.png', f'./assets/{num}.png')


if __name__ == "__main__":
   main(sys.argv[1:])