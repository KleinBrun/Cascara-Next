-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image_url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "revenue" (
    "month" TEXT NOT NULL PRIMARY KEY,
    "revenue" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Revenue_month_key" ON "Revenue"("month");

INSERT
    OR IGNORE INTO "user" ("id", "name", "email", "password")
VALUES
    (
        '410544b2-4001-4271-9855-fec4b6a6442a',
        'User',
        'user@user.com',
        '123456'
    );

INSERT
    OR IGNORE INTO "invoice" ("id", "customer_id", "amount", "status", "date")
VALUES
    (
        '1',
        '3958dc9e-712f-4377-85e9-fec4b6a6442a',
        '15795',
        'pending',
        '2022-12-06'
    ),
    (
        '2',
        '3958dc9e-742f-4377-85e9-fec4b6a6442a',
        '20348',
        'paid',
        '2022-11-14'
    );

INSERT
    OR IGNORE INTO "customer" ("id", "name", "email", "image_url")
VALUES
    (
        '3958dc9e-712f-4377-85e9-fec4b6a6442a',
        'Delba de Oliveira',
        'delba@oliveira.com',
        '/customers/delba-de-oliveira.png'
    ),
    (
        '3958dc9e-742f-4377-85e9-fec4b6a6442a',
        'Lee Robinson',
        'lee@robinson.com',
        '/customers/lee-robinson.png'
    );

INSERT
    OR IGNORE INTO "revenue" ("month", "revenue")
VALUES
    ('Jan', 2000),
    ('Feb', 1800),
    ('Mar', 2200),
    ('Apr', 2500),
    ('May', 2300),
    ('Jun', 3200),
    ('Jul', 3500),
    ('Aug', 3700),
    ('Sep', 2500),
    ('Oct', 2800),
    ('Nov', 3000),
    ('Dec', 4800);