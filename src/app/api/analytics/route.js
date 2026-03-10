import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '30daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });

    // We run two reports: one for totals, one for geographic breakdown
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }], // 🌍 This gets the region data
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' }
      ],
    });

    // Process Country Data for the Pie Chart
    const regionData = response.rows.map(row => ({
      name: row.dimensionValues[0].value,
      value: parseInt(row.metricValues[0].value)
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 countries

    const totalUsers = response.rows.reduce((acc, row) => acc + parseInt(row.metricValues[0].value), 0);
    const totalViews = response.rows.reduce((acc, row) => acc + parseInt(row.metricValues[1].value), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalViews,
        regionData
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}