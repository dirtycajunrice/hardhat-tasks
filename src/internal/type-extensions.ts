import "hardhat/types/runtime";
import { HardhatTasksHelpers } from "./types";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    dcr: HardhatTasksHelpers;
  }
}
