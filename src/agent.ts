import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

let findingsCount = 0;

export const NETHERMIND_DEPLOYER_ADDRESS =
  "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";
export const BOT_DEPLOY_FUNC =
  "function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds)";
export const FORTA_CONTRACT_ADDRESS =
  "0x61447385B019187daa48e91c55c02AF1F1f3F863";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // filter the transaction logs for the Nethermind deployer create agent function
  // returns an array of transaction logs that have called the createAgent function on the Forta contract addresss
  const nethermindDeployAgentCalls = txEvent.filterFunction(
    BOT_DEPLOY_FUNC,
    FORTA_CONTRACT_ADDRESS
  );

  console.log("here");
  nethermindDeployAgentCalls.forEach((deployCalls) => {
    // extract deploy bot event arguments
    const { agentId, owner, metadata, chainIds } = deployCalls.args;
    // if the owner is nethermind deployer, report it
    console.log(deployCalls.args);
    if (
      txEvent.from == NETHERMIND_DEPLOYER_ADDRESS.toLowerCase() &&
      txEvent.to == FORTA_CONTRACT_ADDRESS.toLowerCase()
    ) {
      console.log("detected!");

      findings.push(
        Finding.fromObject({
          name: "Nethermind Deployed Forta Agent",
          description: "Nethermind has just deployed a Forta Agent",
          alertId: "DEPLOY-" + findingsCount.toString(),
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {},
        })
      );
    }

    findingsCount += 1;
  });

  return findings;
};

export default {
  handleTransaction,
  // handleBlock
};
