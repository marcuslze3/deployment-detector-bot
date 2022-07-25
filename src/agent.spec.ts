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
import { Interface } from "ethers/lib/utils";
import { TestTransactionEvent } from "forta-agent-tools/lib/tests";

// const used for tests
const IFACE = new Interface([BOT_DEPLOY_FUNC]);

describe("nethermind new agent deployment bot", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    // first test
    it("returns empty findings if no agent deployed", async () => {
      const mockTxEvent = new TestTransactionEvent();
      const findings: Finding[] = await handleTransaction(mockTxEvent);

      // expect empty return since no agent deployed
      expect(findings).toStrictEqual([]);
    });

    // second test
    it("returns empty findings if agent deployed but not by Nethermind", async () => {
      const mockTxEvent = new TestTransactionEvent()
        .setFrom("0xabc")
        .setTo(FORTA_CONTRACT_ADDRESS);
      const findings: Finding[] = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });

    // third test
    it("returns findings if agent deployed by Nethermind", async () => {
      const mockTxEvent = new TestTransactionEvent()
        .setFrom(NETHERMIND_DEPLOYER_ADDRESS)
        .setTo(FORTA_CONTRACT_ADDRESS)
        .addTraces({
          to: FORTA_CONTRACT_ADDRESS,
          from: NETHERMIND_DEPLOYER_ADDRESS,
          input: IFACE.encodeFunctionData("createAgent", [
            "100",
            NETHERMIND_DEPLOYER_ADDRESS,
            "example metadata",
            [137]
          ])
        })

      const findings: Finding[] = await handleTransaction(mockTxEvent);

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
