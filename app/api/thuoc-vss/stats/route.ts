import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWhereClause, SearchFilter } from "@/lib/filter-utils";

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    
    let filter: SearchFilter | null = null;
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      try {
        filter = JSON.parse(filterParam);
      } catch (e) {
        // Invalid filter, ignore
      }
    }

    // Build where clause for search
    const where = buildWhereClause(filter, search);

    // Get all records with prices
    const allRecords = await prisma.thuocVSS.findMany({
      where,
      select: {
        donGia: true,
      },
    });

    // Filter out records with invalid prices and convert to numbers
    const prices = allRecords
      .map((record: { donGia: string | null }) => {
        if (!record.donGia) return null;
        // Remove commas and convert to number
        const price = parseFloat(
          record.donGia.toString().replace(/,/g, "").trim()
        );
        return isNaN(price) ? null : price;
      })
      .filter((price: number | null): price is number => price !== null);

    const total = allRecords.length;
    let avgPrice = 0;
    let modePrice = 0;
    let medianPrice = 0;
    let minPrice = 0;
    let maxPrice = 0;

    if (prices.length > 0) {
      // Calculate average
      avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;

      // Calculate min and max
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);

      // Calculate median
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const mid = Math.floor(sortedPrices.length / 2);
      medianPrice =
        sortedPrices.length % 2 === 0
          ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
          : sortedPrices[mid];

      // Calculate mode (most frequent price, rounded to nearest 1000)
      const priceGroups: { [key: number]: number } = {};
      prices.forEach((price: number) => {
        const rounded = Math.round(price / 1000) * 1000;
        priceGroups[rounded] = (priceGroups[rounded] || 0) + 1;
      });
      const modeEntry = Object.entries(priceGroups).reduce((a, b) =>
        a[1] > b[1] ? a : b
      );
      modePrice = parseFloat(modeEntry[0]);
    }

    return NextResponse.json({
      total,
      avgPrice: Math.round(avgPrice),
      modePrice,
      medianPrice: Math.round(medianPrice),
      minPrice,
      maxPrice,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

