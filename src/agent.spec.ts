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
  BOT_DEPLOY_EVENT,
} from "./agent";

describe("nethermind new agent deployment bot", () => {
  let handleTransaction: HandleTransaction;
  const mockTxEvent = createTransactionEvent({} as any);

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {

    // first test
    it("returns empty findings if no agent deployed", async () => {
      mockTxEvent.filterFunction = jest.fn().mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      // expect empty return since no agent deployed
      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        BOT_DEPLOY_EVENT,
        FORTA_CONTRACT_ADDRESS
      );
    });

    // second test
    it("returns empty findings if agent deployed but not by Nethermind", async () => {
      const mockTetherTransferEvent = {
        args: {
          agentId:  1,
          owner: "0xabc",
        },
      };
      mockTxEvent.filterLog = jest
        .fn()
        .mockReturnValue([mockTetherTransferEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        BOT_DEPLOY_EVENT,
        FORTA_CONTRACT_ADDRESS
      );
    });

    // third test
    it("returns findings if agent deployed by Nethermind", async () => {
      const mockTetherTransferEvent = {
        args: {
          agentId:  1,
          owner: NETHERMIND_DEPLOYER_ADDRESS,
        },
      };
      mockTxEvent.filterLog = jest
        .fn()
        .mockReturnValue([mockTetherTransferEvent]);

      const findings = await handleTransaction(mockTxEvent);

      // expect empty return since no Tether transferred
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Nethermind Deployed Bot",
          description: "Nethermind has just deployed a Forta Bot",
          alertId: "DEPLOY-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
        }),
      ]);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
        BOT_DEPLOY_EVENT,
        FORTA_CONTRACT_ADDRESS
      );
    });

  });
});


