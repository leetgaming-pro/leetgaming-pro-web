import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type InvestorLeadPayload = {
  email?: string;
  name?: string;
  organization?: string;
  source?: string;
  timestamp?: string;
  pagePath?: string;
  referrer?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeLead(body: InvestorLeadPayload) {
  return {
    email: body.email?.trim().toLowerCase() || "",
    name: body.name?.trim() || undefined,
    organization: body.organization?.trim() || undefined,
    source: body.source?.trim() || "investor-unknown",
    timestamp: body.timestamp || new Date().toISOString(),
    pagePath: body.pagePath?.trim() || undefined,
    referrer: body.referrer?.trim() || undefined,
    userAgent: undefined as string | undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InvestorLeadPayload;
    const lead = normalizeLead(body);
    lead.userAgent = request.headers.get("user-agent") || undefined;

    if (!lead.email || !isValidEmail(lead.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid email is required",
        },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.INVESTOR_LEAD_WEBHOOK_URL;
    const webhookBearer = process.env.INVESTOR_LEAD_WEBHOOK_BEARER_TOKEN;
    const submittedAt = new Date().toISOString();

    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(webhookBearer
            ? { Authorization: `Bearer ${webhookBearer}` }
            : {}),
        },
        body: JSON.stringify({
          type: "investor_lead",
          submittedAt,
          lead,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Webhook delivery failed");
        logger.error("[API /api/investors/leads] Webhook delivery failed", {
          status: response.status,
          error: errorText,
          source: lead.source,
          email: lead.email,
        });

        return NextResponse.json(
          {
            success: false,
            error: "Failed to deliver investor lead",
          },
          { status: 502 }
        );
      }
    } else {
      logger.info("[API /api/investors/leads] Investor lead received without webhook destination", {
        email: lead.email,
        source: lead.source,
        organization: lead.organization,
        submittedAt,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        received: true,
        submittedAt,
      },
      message: "Investor lead received",
    });
  } catch (error) {
    logger.error("[API /api/investors/leads] Error receiving investor lead", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to receive investor lead",
      },
      { status: 500 }
    );
  }
}