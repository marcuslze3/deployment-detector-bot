import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";


export const NETHERMIND_DEPLOYER_ADDRESS = '0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8';
export const BOT_DEPLOY_EVENT = "function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds)";
export const FORTA_CONTRACT_ADDRESS = "0x61447385B019187daa48e91c55c02AF1F1f3F863";
let findingsCount = 0;

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // limiting this agent to emit only 5 findings so thast the alert feed is not spammed
  if (findingsCount >= 5) return findings;
  
  // filter the transaction logs for the Nethermind deployer create agent function
  // returns an array of transaction logs that have called the createAgent function on the Forta contract addresss
  const nethermindDeployAgentCalls = txEvent.filterFunction(
    BOT_DEPLOY_EVENT,
    FORTA_CONTRACT_ADDRESS
  );

  nethermindDeployAgentCalls.forEach((deployCalls) => {
    // extract deploy bot event arguments
    const { agentId, owner, metadata, chainIds } = deployCalls.args;
    // if the owner is nethermind deployer, report it
    if (owner == NETHERMIND_DEPLOYER_ADDRESS) {
      findings.push(
        Finding.fromObject({
          name: "Nethermind Deployed Bot",
          description: "Nethermind has just deployed a Forta Bot",
          alertId: "DEPLOY-1",
          severity: FindingSeverity.Low,  
          type: FindingType.Info
        })
      );

      findingsCount++;
    }

  });

  return findings;
};

export default {
  handleTransaction,
  // handleBlock
};