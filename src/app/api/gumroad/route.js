import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = process.env.GUMROAD_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Missing Gumroad token in .env' });
    }

    // 1. Fetch all your products securely from Gumroad
    const res = await fetch(`https://api.gumroad.com/v2/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      // We tell Next.js to re-fetch this every 60 seconds so your dashboard is always live
      next: { revalidate: 60 } 
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error('Gumroad rejected the request. Check your token!');
    }

    // 2. Extract the product list
    const products = data.products;

    // 3. Calculate your total lifetime metrics
    let totalSales = 0;
    let totalRevenueCents = 0;

    const formattedProducts = products.map(p => {
      totalSales += p.sales_count;
      totalRevenueCents += p.sales_usd_cents;

      return {
        id: p.id,
        name: p.name,
        sales: p.sales_count,
        revenue: p.sales_usd_cents / 100, // Gumroad sends pennies, we convert to dollars
        maxRevenue: 0 // We will calculate this below for your CSS bar chart!
      };
    });

    // 4. Sort products by most revenue generated
    formattedProducts.sort((a, b) => b.revenue - a.revenue);

    // 5. Find the highest revenue single product to scale your progress bars
    const highestRev = formattedProducts.length > 0 ? formattedProducts[0].revenue : 1;
    formattedProducts.forEach(p => p.maxRevenue = highestRev);

    // 6. Format the total money to look beautiful (e.g., $2,450.00)
    const moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSales: totalSales.toString(),
        totalRevenue: moneyFormatter.format(totalRevenueCents / 100),
        topProducts: formattedProducts.slice(0, 3) // Send only the top 3 best-sellers
      }
    });

  } catch (error) {
    console.error('Gumroad API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}