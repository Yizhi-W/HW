// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Uncomment this line to use console.log
//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
contract MyERC20 is ERC20 {

    mapping(address => bool) claimedAirdropPlayerList;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000);
    }
    function airdrop() external {
        require(claimedAirdropPlayerList[msg.sender] == false, "This user has claimed airdrop already");
        _mint(msg.sender, 100);
        claimedAirdropPlayerList[msg.sender] = true;
    }
}


contract MyERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {

    }
    uint32 total_index;
    function awardItem(address player)
        public
        returns (uint256)
    {

        uint256 newItemId = total_index;
        total_index = total_index+ 15;
        _mint(player, newItemId);

        return newItemId;
    }
}
contract StudentSocietyDAO {

    // use a event if you want
    event ProposalInitiated(uint32 proposalIndex);
    event Approve(address who);
    event Disapprove(address who);
    event Log(string);
    event Log(uint256);
    uint256 constant public VOTE_AMOUNT = 5;
    uint256 constant public CREATE_AMOUNT = 10;
    uint256 constant public WIN_AMOUNT = 15;
    struct Voter {
        //bool[] voted;  // 若为真，代表该人已投票
        mapping(uint=>bool) voted;
        uint vote;   // 投票提案的索引
        uint count;
    }
    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        string content;
        uint agree;
        uint disagree;
        bool state;
    }
    uint32 total_index;
    Proposal[] public pros;
    MyERC20 public  studentERC20;
    MyERC721 public my721;
    //mapping(uint32 => Proposal) proposals; // A map from proposal index to proposal
    mapping(address => Voter) public voters;

    constructor() {
        studentERC20 = new MyERC20("GroupToken", "GroupTokenSymbol");
        my721 = new MyERC721("Group721", "Group721Symbol");
    }
    function createproposal(string memory pro_name,string memory pro_con,uint256 newduration) external{
        studentERC20.transferFrom(msg.sender, address(this), CREATE_AMOUNT);
        pros.push(Proposal({
            index: total_index,
            proposer: msg.sender,
            startTime: block.timestamp,
            duration: newduration,
            name: pro_name,
            content :pro_con,
            agree: 0,
            disagree: 0,
            state: false
        }));
        total_index++;
    }
    function approve(uint pro_index) external{
        require((pros[pro_index].startTime+pros[pro_index].duration)>block.timestamp, "Proposal has ended");
        Voter storage sender = voters[msg.sender];
        require(!sender.voted[pro_index], "Already voted.");
        sender.voted[pro_index] = true;
        sender.vote = pro_index;
        pros[pro_index].agree += 1;
        studentERC20.transferFrom(msg.sender, address(this), VOTE_AMOUNT);
        emit Approve(msg.sender);
    }
    function disapprove(uint pro_index) external{
        require((pros[pro_index].startTime+pros[pro_index].duration)>block.timestamp, "Proposal has ended");
        Voter storage sender = voters[msg.sender];
        require(!sender.voted[pro_index], "Already voted.");
        sender.voted[pro_index] = true;
        sender.vote = pro_index;
        pros[pro_index].disagree += 1;
        studentERC20.transferFrom(msg.sender, address(this), VOTE_AMOUNT);
        emit Disapprove(msg.sender);
    }
    function getAgree(uint pro_index) external view returns(uint num){
        return pros[pro_index].agree;
    }
    function getDisagree(uint pro_index) external view returns(uint num){
        return pros[pro_index].disagree;
    }
    // function getProposals() external view returns(Proposal[] memory){
    //     uint resultCount;
    //     for(uint i = 0;i<pros.length;i++){
    //         if(pros[i].state == false){
    //             resultCount++;
    //         }
    //     }
    //     Proposal[] memory result = new Proposal[](resultCount);
    //     for(uint i = 0;i<pros.length;i++){
    //         if(pros[i].state == false){
    //             result[i] = pros[i];
    //         }
    //     }
    //     return result;
    // }
    function getProposals() external view returns(Proposal[] memory){
        Proposal[] memory result = new Proposal[](pros.length);
        for(uint i = 0;i<pros.length;i++){
            result[i] = pros[i];
        }
        return result;
    }
    function getOldProposals() external view returns(Proposal[] memory){
        uint resultCount;
        for(uint i = 0;i<pros.length;i++){
            if(pros[i].state == true){
                resultCount++;
            }
        }
        Proposal[] memory result = new Proposal[](resultCount);
        for(uint i = 0;i<pros.length;i++){
            if(pros[i].state == true){
                result[i] = pros[i];
            }
        }
        return result;
    }
    // function helloworld() pure external returns(string memory) {
    //     return "hello world";
    // }
    // function winningProposal(uint pro_index) external
    //         returns (bool win)
    // {
    //     if(pros[pro_index].agree>pros[pro_index].disagree){
    //         studentERC20.transfer(pros[pro_index].proposer ,WIN_AMOUNT);
    //         win = true;
    //     }
    // }
    function endproposal() external{
        bool reward = false;
        for(uint i = 0;i<pros.length;i++){
            if(pros[i].startTime+pros[i].duration<block.timestamp){
                reward = true;
                if(pros[i].state==false&&(pros[i].agree>pros[i].disagree)){
                    studentERC20.transfer(pros[i].proposer ,WIN_AMOUNT);
                    voters[pros[i].proposer].count++;
                    if(voters[pros[i].proposer].count==3){
                        my721.awardItem(pros[i].proposer);
                        voters[pros[i].proposer].count = 0;
                    }
                }
                pros[i].state = true;
            }
        }
        if(reward){
            studentERC20.transfer(msg.sender ,5);
        }
    }
}
