// JWT is stateless; logout is handled client-side by discarding the token.
// This use case exists as a placeholder for future token blacklisting.
export class LogoutUseCase {
  async execute(_userId: string): Promise<void> {
    // no-op for now
  }
}
