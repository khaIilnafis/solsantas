import sys
from shutil import copyfile
import json

metadata = {"name": "Secret Santas on Solana #0",
            "symbol": "SSoS",
            "description": "Support Beauty 2 The Streetz by donating 0.033 SOL, receive the SSoS token and exchange it to participate in a Secret Santa NFT exchange!",
            "seller_fee_basis_points": 500,
            "image": "",
            "external_url": "https://solsantas.xyz",
            "attributes": [
                {
                    "trait_type": "Year",
                    "value": "2021"
                }
            ],
            "collection": {
                "name": "Secret Santas on Solana",
                "family": "Secret Santas on Solana"
            },
            "properties": {
                "category": "image",
                "creators": [
                    {
                        "address": "AHbBtMjw4aeEDfUetWLfXV6EDaE5p6VuAv1zgiWNMhiS",
                        "share": 100
                    }
                ]
            }}


def iterate_metadata(iteration):
    new_metadata = metadata
    new_metadata['name'] = new_metadata['name'].replace(
        new_metadata['name'], f'Secret Santas on Solana #{str(iteration +1)}', 1)
    new_metadata['image'] = f'{iteration}.gif'
    return new_metadata


def main(args):
    count = int(args[0])
    for num in range(count):
        updated_metadata = iterate_metadata(num)
        f = open(f'./assets/{num}.json', 'w')
        f.write(json.dumps(updated_metadata))
        f.close()
        copyfile('SSoS_Coin_GIF.gif', f'./assets/{num}.gif')


if __name__ == "__main__":
    main(sys.argv[1:])
