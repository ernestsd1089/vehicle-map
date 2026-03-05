import { Owner } from "./owner.model";
import { Vehicle } from "./vehicle.model";

export interface User {
  userid: number;
  owner: Owner;
  vehicles: Vehicle[];
}