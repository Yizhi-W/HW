import React from 'react';
import './App.css';
import './mycss.css';
import {useEffect, useState} from 'react';
import {studentsocietydaoyContract, myERC20Contract, myERC721Contract, web3} from "./utils/contracts";
//import { listenerCount } from 'process';
const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

function App() {
     
  const [account, setAccount] = useState('')
  const [accountBalance, setAccountBalance] = useState(0)
  const [accountBalance721, setAccountBalance721] = useState(0)
  const [playAmount, setPlayAmount] = useState(0)
//   const [totalAmount, setTotalAmount] = useState(0)
//   const [playerNumber, setPlayerNumber] = useState(0)
//   const [managerAccount, setManagerAccount] = useState('')
  useEffect(() => {
    // 初始化检查用户是否已经连接钱包
    // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
    const initCheckAccounts = async () => {
        // @ts-ignore
        const {ethereum} = window;
        if (Boolean(ethereum && ethereum.isMetaMask)) {
            // 尝试获取连接的用户账户
            const accounts = await web3.eth.getAccounts()
            if(accounts && accounts.length) {
                setAccount(accounts[0])
            }
        }
    }

    initCheckAccounts()
  }, [])


    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])
    //ERC721
    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC721Contract) {
                const abc = await myERC721Contract.methods.balanceOf(account).call()
                setAccountBalance721(abc)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])


    useEffect(() => {
        const getLotteryContractInfo = async () => {
            if (studentsocietydaoyContract) {
                // const ma = await studentsocietydaoyContract.methods.manager().call()
                // setManagerAccount(ma)
                // const pn = await studentsocietydaoyContract.methods.getPlayerNumber().call()
                // setPlayerNumber(pn)
                const pa = await studentsocietydaoyContract.methods.CREATE_AMOUNT().call()
                setPlayAmount(pa)
                // const ta = await studentsocietydaoyContract.methods.totalAmount().call()
                // setTotalAmount(ta)
            } else {
                alert('Contract not exists.')
            }
        }

        getLotteryContractInfo()
    }, [])

    const onClickConnectWallet = async () => {
  // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
  // @ts-ignore
  const {ethereum} = window;
  if (!Boolean(ethereum && ethereum.isMetaMask)) {
      alert('MetaMask is not installed!');
      return
  }

  try {
      // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
      if (ethereum.chainId !== GanacheTestChainId) {
          const chain = {
              chainId: GanacheTestChainId, // Chain-ID
              chainName: GanacheTestChainName, // Chain-Name
              rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
          };

          try {
              // 尝试切换到本地网络
              await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
          } catch (switchError: any) {
              // 如果本地网络没有添加到Metamask中，添加该网络
              if (switchError.code === 4902) {
                  await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                  });
              }
          }
      }

      // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
      await ethereum.request({method: 'eth_requestAccounts'});
      // 获取小狐狸拿到的授权用户列表
      const accounts = await ethereum.request({method: 'eth_accounts'});
      // 如果用户存在，展示其account，否则显示错误信息
      setAccount(accounts[0] || 'Not able to get accounts');
    } catch (error: any) {
        alert(error.message)
    }
  }


  const onClaimTokenAirdrop = async () => {
    if(account === '') {
        alert('You have not connected wallet yet.')
        return
    }

    if (myERC20Contract) {
        try {
            await myERC20Contract.methods.airdrop().send({
                from: account
            })
            const newab = await myERC20Contract.methods.balanceOf(account).call()
            setAccountBalance(newab)
            //alert('You have claimed ZJU Token.')
        } catch (error: any) {
            alert(error.message)
        }

    } else {
        alert('Contract not exists.')
    }
}
class SetProposal extends React.Component{
        state = {
            title: "title",
            new_proposal: 'proposal',
            duration:  0,
            list: [ ],
            over_list: [ ]
        }
        oncreateproposal = async (title:any,new_pro:any,duration:any) => {
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
        
            if (studentsocietydaoyContract && myERC20Contract) {
                try {
                    await myERC20Contract.methods.approve(studentsocietydaoyContract.options.address, playAmount).send({
                        from: account
                    })
                    await studentsocietydaoyContract.methods.createproposal(title,new_pro,duration).send({
                        from: account
                    })
                    const newab = await myERC20Contract.methods.balanceOf(account).call()
                    setAccountBalance(newab)
                    this.setState({
                        list: await studentsocietydaoyContract.methods.getProposals().call()
                    })
                    //alert('You have created the proposal.')
                } catch (error: any) {
                    alert(error.message)
                }
            } else {
                alert('Contract not exists.')
            }

            
        }
        inputChange1 = (e:any) =>{
            this.setState({
                title: e.target.value
            })
        }
        inputChange2 = (e:any) =>{
            this.setState({
                new_proposal: e.target.value
            })
        }
        inputChange3 = (e:any) =>{
            this.setState({
                duration: e.target.value
            })
        }
        submintPro = () =>{
            console.log("提交"+this.state.new_proposal)
            if(this.state.new_proposal!=''){
                console.log("允许提交"+this.state.new_proposal)
                this.oncreateproposal(this.state.title,this.state.new_proposal,this.state.duration)
            }
        }
        subApprove = async (index:any) =>{
            console.log("index of approval")
            console.log(index)
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (studentsocietydaoyContract && myERC20Contract) {
                try {
                    myERC20Contract.methods.approve(studentsocietydaoyContract.options.address, 5).send({
                        from: account
                    })
                    studentsocietydaoyContract.methods.approve(index).send({
                        from: account
                    })
                    const newab = await myERC20Contract.methods.balanceOf(account).call()
                    setAccountBalance(newab)
                    this.setState({
                        list: await studentsocietydaoyContract.methods.getProposals().call()
                    })
                } catch (error: any) {
                    alert(error.message)
                }
            } else {
                alert('Contract not exists.')
            }
        }
        subDisApprove = async (index:any) =>{
            console.log("index of disapproval")
            console.log(index)
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (studentsocietydaoyContract && myERC20Contract) {
                try {
                    myERC20Contract.methods.approve(studentsocietydaoyContract.options.address, 5).send({
                        from: account
                    })
                    studentsocietydaoyContract.methods.disapprove(index).send({
                        from: account
                    })
                    const newab = await myERC20Contract.methods.balanceOf(account).call()
                    setAccountBalance(newab)
                    this.setState({
                        list: await studentsocietydaoyContract.methods.getProposals().call()
                    })
                } catch (error: any) {
                    alert(error.message)
                }
            } else {
                alert('Contract not exists.')
            }
        }
        endProposal = async ()=>{
            console.log("begin to end")
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (studentsocietydaoyContract && myERC20Contract) {
                try {
                    studentsocietydaoyContract.methods.endproposal().send({
                        from: account,gas:3000000
                    })
                    this.getPro()
                    this.getOldPro()
                    const newab = await myERC20Contract.methods.balanceOf(account).call()
                    setAccountBalance(newab)
                } catch (error: any) {
                    alert(error.message)
                }
            } else {
                alert('Contract not exists.')
            }
            console.log("over")
        }
        getPro = async () =>{
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            console.log("获取提案")
            console.log("list:: "+this.state.list)
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (studentsocietydaoyContract) {
                try {
                    this.setState({
                        list: await studentsocietydaoyContract.methods.getProposals().call()
                    })
                    console.log("begin list")
                    console.log(this.state.list)
                    console.log("over list")
                } catch (error: any) {
                    alert(error.message)
                }
            } 
            else {
                alert('Contract not exists.')
            }
        }
        getOldPro = async () =>{
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            //console.log("获取提案")
            //console.log("over_list:: "+this.state.over_list)
            if(account === '') {
                alert('You have not connected wallet yet.')
                return
            }
            if (studentsocietydaoyContract && myERC20Contract) {
                try {
                    this.setState({
                        over_list: await studentsocietydaoyContract.methods.getOldProposals().call()
                    })
                    // console.log("begin over_list")
                    // console.log(this.state.over_list)
                    // console.log("over over_list")
                } catch (error: any) {
                    alert(error.message)
                }
            } 
            else {
                alert('Contract not exists.')
            }
        }
        render (){
            return (
                <div  className='row'>
                    <div className="column" style={{backgroundColor:"#bbb"}}>
                    <p>当前未完结提案</p>
                    <div>
                        {this.state.list.map((item,index)=>{
                            return item[8]===false ? <div>title:{item[4]}<br></br>
                            proposal:{item[5]}<br></br>
                            <button onClick={()=>this.subApprove(item[0])}>approval:{item[6]}</button>
                            <button onClick={()=>this.subDisApprove(item[0])}>disapproval:{item[7]}</button></div>:''
                            
                        })}
                    </div>
                    </div>
                    <div className="column" style={{backgroundColor:"#aaa"}}>
                    <label>提案标题:</label>
                    <input type='text' onChange = {this.inputChange1}></input><br></br>
                    <label>提案:</label>
                    <input type='text' onChange = {this.inputChange2}></input><br></br>
                    <label>持续时间(s):</label>
                    <input type='number' min={0} onChange = {this.inputChange3}></input><br></br>
                    <button onClick={this.submintPro}>提交提案</button>
                    <button onClick={this.endProposal}>中止提案</button>
                    <br></br>
                    <button onClick={this.getPro}>查询当前提案</button>
                    <button onClick={this.getPro}>查询完结提案</button>
                    </div>
                    <div className="column" style={{backgroundColor:"#ccc"}}>
                    <p>当前已完结提案</p>
                    {/* <ul>
                        {this.state.over_list.map((item,index)=>{
                            //console.log(item)
                            return <li key={index}>
                                title:{item[4]} <br></br>
                                proposal:{item[5]}<br></br>
                                <button>approval:{item[6]}</button>
                                <button>disapproval:{item[7]}</button>
                                </li>
                        })}
                    </ul> */}
                    <div>
                        {this.state.list.map((item,index)=>{
                            return item[8]===true ? <div>title:{item[4]}<br></br>
                            proposal:{item[5]}<br></br>
                            <button>approval:{item[6]}</button>
                            <button>disapproval:{item[7]}</button></div>:''
                        })}
                    </div>
                    </div>
                    
                </div>
            )
        }
    }
  return (
    <div>
        <div className='header'>
            <h1>DEMO</h1>
            {account === '' && <button onClick={onClickConnectWallet}>连接钱包</button>}
            <button onClick={onClaimTokenAirdrop}>领取积分</button>
            <div>当前用户：{account === '' ? '无用户连接' : account}</div>
            <div>当前用户拥有积分数量：{account === '' ? 0 : accountBalance}</div>
            <div>当前用户拥有纪念币数量：{account === '' ? 0 : accountBalance721}</div>
        </div>
        <div><SetProposal></SetProposal></div>
    </div>
  );
}

export default App;
