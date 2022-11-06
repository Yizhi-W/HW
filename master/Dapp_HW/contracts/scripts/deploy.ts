import { ethers } from "hardhat";

async function main() {
  const StudentSocietyDAO = await ethers.getContractFactory("StudentSocietyDAO");
  const studentSocietyDAO = await StudentSocietyDAO.deploy();
  await studentSocietyDAO.deployed();

  const myERC20 = await studentSocietyDAO.studentERC20();
  const myERC721 = await studentSocietyDAO.my721();
  console.log(`StudentSocietyDAO deployed to ${studentSocietyDAO.address}`);
  console.log(`MyERC20 deployed to ${myERC20}`);
  console.log(`MyERC721 deployed to ${myERC721}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
