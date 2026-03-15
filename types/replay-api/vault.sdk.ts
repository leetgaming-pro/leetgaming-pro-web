import { ReplayApiClient } from "./replay-api.client";
import type {
  TeamVault,
  VaultBalance,
  VaultProposal,
  ProposalsResult,
  VaultActivityResult,
  VaultAnalytics,
  VaultInventoryResult,
  ProposalFilters,
  ActivityFilters,
  InventoryFilters,
  CreateVaultRequest,
  VaultDepositRequest,
  ProposeTransactionRequest,
  ApproveProposalRequest,
  RejectProposalRequest,
  UpdateVaultSettingsRequest,
  DepositItemRequest,
  ProposeItemTransferRequest,
} from "./vault.types";

function generateIdempotencyKey(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

/**
 * VaultAPI provides access to team vault endpoints
 * All routes are scoped under /squads/{squad_id}/vault
 */
export class VaultAPI {
  constructor(private client: ReplayApiClient) {}

  private vaultPath(squadId: string): string {
    return `/squads/${squadId}/vault`;
  }

  // ─── Queries ────────────────────────────────────────────────────────────

  async getVault(squadId: string): Promise<TeamVault | null> {
    const response = await this.client.get<TeamVault>(
      this.vaultPath(squadId)
    );
    if (response.error) {
      console.error("Failed to fetch vault:", response.error);
      return null;
    }
    return response.data || null;
  }

  async getBalance(squadId: string): Promise<VaultBalance | null> {
    const response = await this.client.get<VaultBalance>(
      `${this.vaultPath(squadId)}/balance`
    );
    if (response.error) {
      console.error("Failed to fetch vault balance:", response.error);
      return null;
    }
    return response.data || null;
  }

  async getProposals(
    squadId: string,
    filters: ProposalFilters = {}
  ): Promise<ProposalsResult | null> {
    const qs = buildQueryString(filters as Record<string, string | number>);
    const response = await this.client.get<ProposalsResult>(
      `${this.vaultPath(squadId)}/proposals${qs}`
    );
    if (response.error) {
      console.error("Failed to fetch proposals:", response.error);
      return null;
    }
    return response.data || null;
  }

  async getProposalById(
    squadId: string,
    proposalId: string
  ): Promise<VaultProposal | null> {
    const response = await this.client.get<VaultProposal>(
      `${this.vaultPath(squadId)}/proposals/${proposalId}`
    );
    if (response.error) {
      console.error("Failed to fetch proposal:", response.error);
      return null;
    }
    return response.data || null;
  }

  async getActivity(
    squadId: string,
    filters: ActivityFilters = {}
  ): Promise<VaultActivityResult | null> {
    const qs = buildQueryString(filters as Record<string, string | number>);
    const response = await this.client.get<VaultActivityResult>(
      `${this.vaultPath(squadId)}/activity${qs}`
    );
    if (response.error) {
      console.error("Failed to fetch vault activity:", response.error);
      return null;
    }
    return response.data || null;
  }

  async getAnalytics(
    squadId: string,
    from?: string,
    to?: string
  ): Promise<VaultAnalytics | null> {
    const qs = buildQueryString({ from, to });
    const response = await this.client.get<VaultAnalytics>(
      `${this.vaultPath(squadId)}/analytics${qs}`
    );
    if (response.error) {
      console.error("Failed to fetch vault analytics:", response.error);
      return null;
    }
    return response.data || null;
  }

  async getInventory(
    squadId: string,
    filters: InventoryFilters = {}
  ): Promise<VaultInventoryResult | null> {
    const qs = buildQueryString(filters as Record<string, string | number>);
    const response = await this.client.get<VaultInventoryResult>(
      `${this.vaultPath(squadId)}/inventory${qs}`
    );
    if (response.error) {
      console.error("Failed to fetch vault inventory:", response.error);
      return null;
    }
    return response.data || null;
  }

  // ─── Commands ───────────────────────────────────────────────────────────

  async createVault(
    squadId: string,
    request: CreateVaultRequest
  ): Promise<TeamVault | null> {
    const response = await this.client.post<TeamVault>(
      this.vaultPath(squadId),
      request
    );
    if (response.error) {
      console.error("Failed to create vault:", response.error);
      return null;
    }
    return response.data || null;
  }

  async deposit(
    squadId: string,
    request: VaultDepositRequest
  ): Promise<boolean> {
    const safeRequest = {
      ...request,
      idempotency_key: request.idempotency_key || generateIdempotencyKey(),
    };
    const response = await this.client.post<{ status: string }>(
      `${this.vaultPath(squadId)}/deposit`,
      safeRequest
    );
    if (response.error) {
      console.error("Vault deposit failed:", response.error);
      return false;
    }
    return true;
  }

  async proposeTransaction(
    squadId: string,
    request: ProposeTransactionRequest
  ): Promise<VaultProposal | null> {
    const response = await this.client.post<VaultProposal>(
      `${this.vaultPath(squadId)}/proposals`,
      request
    );
    if (response.error) {
      console.error("Failed to create proposal:", response.error);
      return null;
    }
    return response.data || null;
  }

  async approveProposal(
    squadId: string,
    proposalId: string,
    request: ApproveProposalRequest = {}
  ): Promise<boolean> {
    const response = await this.client.post<{ status: string }>(
      `${this.vaultPath(squadId)}/proposals/${proposalId}/approve`,
      request
    );
    if (response.error) {
      console.error("Failed to approve proposal:", response.error);
      return false;
    }
    return true;
  }

  async rejectProposal(
    squadId: string,
    proposalId: string,
    request: RejectProposalRequest
  ): Promise<boolean> {
    const response = await this.client.post<{ status: string }>(
      `${this.vaultPath(squadId)}/proposals/${proposalId}/reject`,
      request
    );
    if (response.error) {
      console.error("Failed to reject proposal:", response.error);
      return false;
    }
    return true;
  }

  async cancelProposal(
    squadId: string,
    proposalId: string
  ): Promise<boolean> {
    const response = await this.client.post<{ status: string }>(
      `${this.vaultPath(squadId)}/proposals/${proposalId}/cancel`,
      {}
    );
    if (response.error) {
      console.error("Failed to cancel proposal:", response.error);
      return false;
    }
    return true;
  }

  async updateSettings(
    squadId: string,
    request: UpdateVaultSettingsRequest
  ): Promise<VaultProposal | null> {
    const response = await this.client.put<VaultProposal>(
      `${this.vaultPath(squadId)}/settings`,
      request
    );
    if (response.error) {
      console.error("Failed to update vault settings:", response.error);
      return null;
    }
    return response.data || null;
  }

  async depositItem(
    squadId: string,
    request: DepositItemRequest
  ): Promise<boolean> {
    const response = await this.client.post<{ status: string }>(
      `${this.vaultPath(squadId)}/inventory`,
      request
    );
    if (response.error) {
      console.error("Failed to deposit item:", response.error);
      return false;
    }
    return true;
  }

  async proposeItemTransfer(
    squadId: string,
    request: ProposeItemTransferRequest
  ): Promise<VaultProposal | null> {
    const response = await this.client.post<VaultProposal>(
      `${this.vaultPath(squadId)}/inventory/transfer`,
      request
    );
    if (response.error) {
      console.error("Failed to propose item transfer:", response.error);
      return null;
    }
    return response.data || null;
  }
}
