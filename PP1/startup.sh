#!/bin/bash

chmod +x run.sh
# Create or overwrite the .env file
cat > .env << 'EOL'
JWT_SECRET='7c790aded86421b733c7aa837c2249d4903574e2d1d5fb310f509719ed503899d2c37118d9feea1c8400b7dd2768a940d853721867059e2f07f0dd86b105241a'
JWT_REFRESH_SECRET='bab29b3aaa29a4633298e41c03226346b3febc941047ca5b433e16d7352d6bc869796df2d22f961406e9cb2363bec231241854346535ee8e6da17042698ecdae'
SALT_ROUNDS=10
EOL
npm install
npx prisma generate
npx prisma migrate dev
npx prisma seed db
# admin email: admin@example.com, password: Test123*