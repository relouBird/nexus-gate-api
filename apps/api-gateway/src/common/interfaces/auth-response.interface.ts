export interface AuthResponse {
  team: TeamModel;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  status: string;
  accessToken: string;
  refreshToken: string;
}

export interface TeamModel {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
}
