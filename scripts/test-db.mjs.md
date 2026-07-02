# Test database connection
# Usage: node scripts/test-db.mjs [email]

Example:
```bash
node scripts/test-db.mjs cesarzaracho2003@gmail.com
```

The script will:
1. Connect to PostgreSQL
2. List all users
3. Find the specific user if email provided
4. Show password hash length (should be 60 for bcrypt)
