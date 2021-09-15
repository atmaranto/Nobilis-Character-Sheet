import argparse

ap = argparse.ArgumentParser(description="Requests a new sheet from the server")

ap.add_argument("ip", nargs="?", default="localhost", help="The IP or domain of the server to connect to")
ap.add_argument("port", nargs="?", default=31419, help="The port to connect on")

args = ap.parse_args()

from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse

print("Requesting...")

r = Request("http://" + args.ip + ":" + str(args.port) + "/api/sheetData", method="POST")
response = urlopen(r)

print("Response:", response.read())