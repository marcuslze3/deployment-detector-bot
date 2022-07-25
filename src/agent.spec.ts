import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import agent, {
  NETHERMIND_DEPLOYER_ADDRESS,
  FORTA_CONTRACT_ADDRESS,
  BOT_DEPLOY_FUNC,
} from "./agent";

import { TestTransactionEvent } from "forta-agent-tools/lib/tests";

describe("nethermind new agent deployment bot", () => {
  let handleTransaction: HandleTransaction;
  //const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    // first test
    it("returns empty findings if no agent deployed", async () => {
      const mockTxEvent = new TestTransactionEvent();
      mockTxEvent.filterFunction = jest.fn().mockReturnValue([]);
      const findings = await handleTransaction(mockTxEvent);

      // expect empty return since no agent deployed
      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        BOT_DEPLOY_FUNC,
        FORTA_CONTRACT_ADDRESS
      );
    });

    // second test
    it("returns empty findings if agent deployed but not by Nethermind", async () => {
      const mockTxEvent = new TestTransactionEvent()
        .setFrom("0xabc")
        .setTo(FORTA_CONTRACT_ADDRESS);
      mockTxEvent.filterFunction = jest.fn().mockReturnValue([]);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        BOT_DEPLOY_FUNC,
        FORTA_CONTRACT_ADDRESS
      );
    });

    // third test
    it("returns findings if agent deployed by Nethermind", async () => {
      const mockTxEvent = new TestTransactionEvent()
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .setTo(FORTA_CONTRACT_ADDRESS);

      const findings = await handleTransaction(mockTxEvent);

      // expect findings since Agent deployed by Nethermind
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Nethermind Deployed Forta Agent",
          description: "Nethermind has just deployed a Forta Agent",
          alertId: "DEPLOY-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {},
        }),
      ]);
    });
  });
});
