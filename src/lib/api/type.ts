// Tester 타입
export type Tester = {
  id: string;
  name: string;
  email: string;
  type: number;
  created_at: string;
  invite: boolean;
};

// History 타입
export type TesterHistory = {
  id: string;
  created_at: string;
  tester_id: string;
  invited: boolean;
  invited_at: string | null;
  notes: string | null;
};

// Result 타입들
export type SuccessResult = {
  ok: true;
};

export type ErrorResult = {
  ok: false;
  status: number;
  message: string;
};

export type InsertResult = SuccessResult | ErrorResult;

export type GetTestersResult =
  | {
      ok: true;
      data: Tester[];
    }
  | ErrorResult;

export type InviteTestersResult =
  | {
      ok: true;
      invitedCount: number;
    }
  | ErrorResult;

export type DeleteTestersResult =
  | {
      ok: true;
      deletedCount: number;
    }
  | ErrorResult;

export type GetHistoryResult =
  | {
      ok: true;
      data: TesterHistory[];
    }
  | ErrorResult;
