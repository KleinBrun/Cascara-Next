const { Pool } = require('pg');
import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import {
  User
} from './definitions';
import { formatCurrency } from './utils';
export async function clientDb() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'bdprueba',
    password: '123456',
    port: 5432,
  });
  return pool;
}
export async function fetchRevenue() {
  const prisma = new PrismaClient()
  try {
    const revenues = await prisma.revenue.findMany()
    await prisma.$disconnect()
    return revenues;
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function fetchLatestInvoices() {
  const prisma = new PrismaClient()
  try {
    const result = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        date: true,
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true
          }
        }
      }, orderBy: {
        date: 'desc'
      }, take: 5
    })

    await prisma.$disconnect()

    const latestInvoices = result.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

export async function fetchCardData() {
  noStore();
  const prisma = new PrismaClient()
  try {

    const invoiceCountPromise = prisma.invoice.count();
    const customerCountPromise = prisma.customer.count();
    const invoiceStatusPromise = prisma.invoice.groupBy({
      by: ['status'],
      _sum: {
        amount: true,
      },
    });

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0]);
    const numberOfCustomers = Number(data[1]);
    const totalPaidInvoices = formatCurrency(data[2][0]._sum.amount ?? 0);
    const totalPendingInvoices = formatCurrency(data[2][1]._sum.amount ?? 0);

    await prisma.$disconnect()

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {

  noStore();
  const prisma = new PrismaClient();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // try {
  //   const invoices = await client.query(`
  //     SELECT
  //       invoices.id,
  //       invoices.amount,
  //       invoices.date,
  //       invoices.status,
  //       customers.name,
  //       customers.email,
  //       customers.image_url
  //     FROM invoices
  //     JOIN customers ON invoices.customer_id = customers.id
  //     WHERE
  //       customers.name ILIKE ${`%${query}%`} OR
  //       customers.email ILIKE ${`%${query}%`} OR
  //       invoices.amount::text ILIKE ${`%${query}%`} OR
  //       invoices.date::text ILIKE ${`%${query}%`} OR
  //       invoices.status ILIKE ${`%${query}%`}
  //     ORDER BY invoices.date DESC
  //     LIMIT $1 OFFSET $2
  //   `, [ITEMS_PER_PAGE, offset]);

  //   return invoices.rows;
  // } catch (error) {
  //   console.error('Database Error:', error);
  //   throw new Error('Failed to fetch invoices.');
  // }
}

export async function fetchInvoicesPages(query: string) {
  noStore();
  const prisma = new PrismaClient()
  // try {
    //   const count = await client.query(`SELECT COUNT(*)
    //   FROM invoices
    //   JOIN customers ON invoices.customer_id = customers.id
    //   WHERE
    //     customers.name ILIKE ${`%$1%`} OR
    //     customers.email ILIKE ${`%$2%`} OR
    //     invoices.amount::text ILIKE ${`%$3%`} OR
    //     invoices.date::text ILIKE ${`%$4%`} OR
    //     invoices.status ILIKE ${`%$5%`}
    // `, [query, query, query, query, query]);

    // const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    // return totalPages;
    const queryDate = new Date(query);
    const count = await prisma.invoice.count({
      where: {
        OR: [
          {
            customer: {
              name: {
                contains: query // Búsqueda parcial en el campo 'name'
              }
            }
          },
          {
            customer: {
              email: {
                contains: query // Búsqueda parcial en el campo 'email'
              }
            }
          },
          {
            amount: {
              equals: parseFloat(query) || 0 // Búsqueda exacta en el campo 'amount'
            }
          },
          {
            status: {
              contains: query // Búsqueda parcial en el campo 'status'
            }
          }
        ]
      }
    });
    console.log("🚀🕸 ~ count:", count)
  // } catch (error) {
  //   console.error('Database Error:', error);
  //   // throw new Error('Failed to fetch total number of invoices.');
  // }
}

export async function fetchInvoiceById(id: string) {
  const pool = await clientDb();
  const client = await pool.connect();
  noStore();
  try {
    const data = await client.query(`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = $1;
    `, [id]);

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    console.log(invoice); // Invoice is an empty array []
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  const pool = await clientDb();
  const client = await pool.connect();
  noStore();
  try {
    const data = await client.query(`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `);

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  const pool = await clientDb();
  const client = await pool.connect();
  try {
    const data = await client.query(`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%$1%`} OR
        customers.email ILIKE ${`%$2%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `, [query, query]);

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  const pool = await clientDb();
  const client = await pool.connect();
  try {
    const user = await client.query(`SELECT * FROM users WHERE email=$1`, [email]);
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
