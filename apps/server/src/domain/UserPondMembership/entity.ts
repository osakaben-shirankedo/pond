import * as v from "valibot";
import { User } from "../user/entity";
import { Pond, PondSchema } from "../pond/entity";
const UserPondMembershipStatusSchema = v.picklist(["pending", "active", "expiration", "banned", "kicked"],)
type UserPondMembershipStatusSchema = v.InferOutput<typeof UserPondMembershipStatusSchema>

export class UserPondMembership {
  private membershipStatus: UserPondMembershipStatusSchema = "pending";

  private constructor(
    public readonly user: User,
    public readonly Pond: PondSchema
  ) { }

  static create(user: User, pond: PondSchema) {
    // assert
    Pond.assertCapacity(pond)

    // do domain logic 
    const membership = new UserPondMembership(user, pond);

    // sync&update repository

  }


  // 承認
  approve() {
    if (this.membershipStatus != "pending") {
      throw Error("Only pending can be approved");
    }
    this.membershipStatus = "active";
  }

  ban() {
    this.membershipStatus = "banned";
  }

  kick() {
    this.membershipStatus = "kicked";
  }

  isActive() {
    return this.membershipStatus == "active";
  }
}