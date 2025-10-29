from databases import Database
from dotenv import load_dotenv
import os

load_dotenv()

uri_database = os.getenv("DATABASE_URL")

db = Database(uri_database)