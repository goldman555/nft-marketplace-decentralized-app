// material
import React from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { isMobile } from 'react-device-detect';
import { styled } from '@mui/material/styles';
import { Container, Stack, Typography, Tab, Tabs, Link, Button, Box, ToggleButtonGroup, ToggleButton, Tooltip, Grid } from '@mui/material';
// import { TabContext, TabList, TabPanel } from '@mui/lab';
import SquareIcon from '@mui/icons-material/Square';
import AppsIcon from '@mui/icons-material/Apps';
import GridViewSharpIcon from '@mui/icons-material/GridViewSharp';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
import sharpContentCopy from '@iconify/icons-ic/sharp-content-copy';
import { Icon } from '@iconify/react';
import editIcon from '@iconify-icons/akar-icons/edit';
import { useWeb3React } from '@web3-react/core';
import jwtDecode from 'jwt-decode';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSnackbar } from 'notistack';

// components
import PaperRecord from '../../components/PaperRecord';
import { essentialsConnector } from '../../components/signin-dlg/EssentialConnectivity';
import { walletconnect } from '../../components/signin-dlg/connectors';
import StyledButton from '../../components/signin-dlg/StyledButton';
import { MHidden } from '../../components/@material-extend';
import Page from '../../components/Page';
import LoadingScreen from '../../components/LoadingScreen';
import MyItemsSortSelect from '../../components/MyItemsSortSelect';
import AssetGrid from '../../components/marketplace/AssetGrid';
import { useEagerConnect } from '../../components/signin-dlg/hook';
import RingAvatar from '../../components/RingAvatar';
import Badge from '../../components/badge/Badge';
import KYCBadge from '../../components/badge/KYCBadge';
import DIABadge from '../../components/badge/DIABadge';
import AddressCopyButton from '../../components/AddressCopyButton';
import IconLinkButtonGroup from '../../components/collection/IconLinkButtonGroup'
import CollectionCard from '../../components/collection/CollectionCard';
import CollectionCardSkeleton from '../../components/collection/CollectionCardSkeleton';
import NeedBuyDIADlg from '../../components/dialog/NeedBuyDIA';
import ChainSelect from '../../components/ChainSelect';
import AssetSortSelect from '../../components/AssetSortSelect';
import useSingin from '../../hooks/useSignin';
import { queryAvatarUrl, queryName, queryDescription, queryWebsite, queryTwitter, queryDiscord, queryTelegram, queryMedium, queryKycMe, downloadAvatar } from '../../components/signin-dlg/HiveAPI'
import { downloadFromUrl } from '../../components/signin-dlg/HiveService'
import { getUserCredentials } from '../../components/signin-dlg/LoadCredentials';
import { reduceHexAddress, getDiaTokenInfo, fetchFrom, getInfoFromDID, getDidInfoFromAddress, isInAppBrowser, getCredentialInfo, getChainTypeFromId } from '../../utils/common';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(12),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(13)
  },
  [theme.breakpoints.down('md')]: {
    paddingBottom: theme.spacing(3)
  }
}));

const StackStyle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const ToolGroupStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  [theme.breakpoints.up('sm')]: {
    position: 'absolute',
    right: 0,
    bottom: 0
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));
// ----------------------------------------------------------------------
export default function MyProfile() {
  const defaultDispMode = isMobile?1:0
  const sessionDispMode = sessionStorage.getItem("disp-mode")
  const params = useParams(); // params.address
  const navigate = useNavigate();
  const [assets, setAssets] = React.useState([[], [], [], [], []]);
  const [collections, setCollections] = React.useState([]);
  const [isLoadingAssets, setLoadingAssets] = React.useState([false, false, false]);
  const [isLoadingCollection, setLoadingCollection] = React.useState(false);
  const [dispmode, setDispmode] = React.useState(sessionDispMode!==null?parseInt(sessionDispMode, 10):defaultDispMode);
  const [controller, setAbortController] = React.useState(new AbortController());
  const [tabValue, setTabValue] = React.useState(params.type!==undefined?parseInt(params.type, 10):0);
  const [walletAddress, setWalletAddress] = React.useState(null);
  const [myAddress, setMyAddress] = React.useState(null);
  const [didInfo, setDidInfo] = React.useState({name: '', description: ''});
  const [avatarUrl, setAvatarUrl] = React.useState(null);
  const [updateCount, setUpdateCount] = React.useState(0);
  const [order, setOrder] = React.useState(0);
  const [chainType, setChainType] = React.useState(0);
  const [buyDIAOpen, setOpenBuyDIA] = React.useState(false);
  const [badge, setBadge] = React.useState({dia: 0, kyc: false});
  const [socials, setSocials] = React.useState({});
  const { diaBalance, pasarLinkChain } = useSingin()

  const context = useWeb3React();
  const { account } = context;

  const queryProfileSocials = {
    website: queryWebsite,
    twitter: queryTwitter,
    discord: queryDiscord,
    telegram: queryTelegram,
    medium: queryMedium
  }
  // const socialTypes = [ 'website', 'twitter', 'discord', 'telegram', 'medium' ]
  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  // const triedEager = useEagerConnect();
  React.useEffect(async() => {
    if(sessionStorage.getItem("PASAR_LINK_ADDRESS") === '1') {
      setMyAddress(account)
      setWalletAddress(account);
    }
    else if(sessionStorage.getItem("PASAR_LINK_ADDRESS") === '2') {
      const strWalletAddress = isInAppBrowser() ? await window.elastos.getWeb3Provider().address : essentialsConnector.getWalletConnectProvider().wc.accounts[0];
      setMyAddress(strWalletAddress)
      setWalletAddress(strWalletAddress);
    }
    else if (sessionStorage.getItem("PASAR_LINK_ADDRESS") === '3') {
      const strWalletAddress = await walletconnect.getAccount()
      setMyAddress(strWalletAddress)
      setWalletAddress(strWalletAddress);
    }
    else if(!params.address) {
      navigate('/marketplace');
    }
    // ----------------------------------------------------------
    if (params.address){
      setWalletAddress(params.address)
      getDidInfoFromAddress(params.address)
        .then((info) => {
          setDidInfo({'name': info.name || '', 'description': info.description || ''})
        })
        .catch((e) => {
        })
    }
    else if(sessionStorage.getItem("PASAR_LINK_ADDRESS") === '2') {
      const targetDid = `did:elastos:${sessionStorage.getItem('PASAR_DID')}`
      const token = sessionStorage.getItem("PASAR_TOKEN");
      const user = jwtDecode(token);
      const {name, bio} = user;

      // getUserCredentials(targetDid)
      //   .then(credentials => {
      //     if(!credentials)
      //       return

      //     if(credentials.name)
      //       setDidInfoValue('name', credentials.name);
      //     else setDidInfoValue('name', name);

      //     if(credentials.description)
      //       setDidInfoValue('description', credentials.description);
      //     else setDidInfoValue('description', bio);

      //     if(credentials.avatarUrl) {
      //       setAvatarUrl((prevState)=>{
      //         if(!prevState)
      //           return credentials.avatarUrl
      //         return prevState
      //       })
      //     }

      //     if(credentials.kycMe)
      //       setBadgeFlag('kyc', true)
      //     else
      //       setBadgeFlag('kyc', false)

      //     socialTypes.forEach((type) => {
      //       if (credentials[type])
      //         setSocials((prevState) => {
      //           const tempState = { ...prevState };
      //           tempState[type] = credentials[type];
      //           return tempState;
      //         });
      //     });
      //   })


      queryName(targetDid)
        .then((res)=>{
          if(res.find_message && res.find_message.items.length)
            setDidInfoValue('name', res.find_message.items[0].display_name)
          else
            setDidInfoValue('name', name)
          
          queryDescription(targetDid).then((res)=>{
            if(res.find_message && res.find_message.items.length)
              setDidInfoValue('description', res.find_message.items[0].display_name)
            else
              setDidInfoValue('description', bio)
          })
          // queryAvatarUrl(targetDid).then((res)=>{
          //   if(res.find_message && res.find_message.items.length) {
          //     const avatarUrl = res.find_message.items[0].display_name
          //     downloadFromUrl(avatarUrl).then(avatarData=>{
          //       if(avatarData && avatarData.length) {
          //         const base64Content = `data:image/png;base64,${avatarData.toString('base64')}`
          //         setAvatarUrl(base64Content)
          //       }
          //     })
          //   }
          // })
          downloadAvatar(targetDid).then((res)=>{
            if(res && res.length) {
              const base64Content = res.reduce((content, code)=>{
                content=`${content}${String.fromCharCode(code)}`;
                return content
              }, '')
              setAvatarUrl((prevState)=>{
                if(!prevState)
                  return `data:image/png;base64,${base64Content}`
                return prevState
              })
            }
          })
          queryKycMe(targetDid).then((res)=>{
            if(res.find_message && res.find_message.items.length)
              setBadgeFlag('kyc', true)
            else
              setBadgeFlag('kyc', false)
          })
          Object.keys(queryProfileSocials).forEach(field=>{
            queryProfileSocials[field](targetDid).then((res)=>{
              if(res.find_message && res.find_message.items.length)
                setSocials((prevState) => {
                  const tempState = {...prevState}
                  tempState[field] = res.find_message.items[0].display_name
                  return tempState
                })
            })
          })
        })
        .catch(e=>{
          console.log(e)
        })
    }
    else {
      setDidInfo({'name': '', 'description': ''})
    }
  }, [account, params.address]);

  const setDidInfoValue = (field, value)=>{
    setDidInfo((prevState)=>{
      const tempState = {...prevState}
      tempState[field] = value
      return tempState
    })
  }

  const handleSwitchTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSwitchSwiper = (value) => {
    setTabValue(value);
  };

  const setLoadingAssetsOfType = (index, value) => {
    setLoadingAssets((prevState) => {
      const tempLoadingAssets = [...prevState];
      tempLoadingAssets[index] = value;
      return tempLoadingAssets;
    });
  };

  const setAssetsOfType = (index, value) => {
    if (!value) return;
    setAssets((prevState) => {
      const tempAssets = [...prevState];
      tempAssets[index] = value;
      return tempAssets;
    });
  };

  const setBadgeFlag = (type, value) => {
    setBadge((prevState) => {
      const tempFlag = {...prevState}
      tempFlag[type] = value
      return tempFlag
    })
  }
  const apiNames = ['getListedCollectiblesByAddress', 'getOwnCollectiblesByAddress', 'getBidCollectiblesByAddress', 'getCreatedCollectiblesByAddress', 'getSoldCollectiblesByAddress'];
  const typeNames = ['listed', 'owned', "bid", 'minted', 'sold'];
  React.useEffect(async () => {
    if(walletAddress){
      getDiaTokenInfo(walletAddress).then(dia=>{
        if(dia!=='0')
          setBadgeFlag('dia', dia)
        else setBadgeFlag('dia', 0)
      })
    }
    controller.abort(); // cancel the previous request
    const newController = new AbortController();
    const { signal } = newController;
    setAbortController(newController);

    Array(5)
      .fill(0)
      .forEach((_, i) => {
        setLoadingAssetsOfType(i, true);
        fetchFrom(`api/v2/sticker/${apiNames[i]}/${walletAddress}?orderType=${order}&marketPlace=${chainType}`, { signal })
          .then((response) => {
            response.json().then((jsonAssets) => {
              setAssetsOfType(i, jsonAssets.data);
              setLoadingAssetsOfType(i, false);
            }).catch((e) => {
              setLoadingAssetsOfType(i, false);
            });
          })
          .catch((e) => {
            if (e.code !== e.ABORT_ERR) setLoadingAssetsOfType(i, false);
          });
      });
  }, [walletAddress, order, chainType, updateCount]);

  React.useEffect(async () => {
    if(walletAddress) {
      setLoadingCollection(true);
      fetchFrom(`api/v2/sticker/getCollectionByOwner/${walletAddress}?marketPlace=${chainType}`)
        .then((response) => {
          response.json().then((jsonAssets) => {
            setCollections(jsonAssets.data);
            setLoadingCollection(false);
          }).catch((e) => {
            setLoadingCollection(false);
          });
        })
        .catch((e) => {
          if (e.code !== e.ABORT_ERR) setLoadingCollection(false);
        });
    }
  }, [walletAddress, chainType]);
  
  const handleDispmode = (event, mode) => {
    if (mode === null)
      return
    sessionStorage.setItem('disp-mode', mode);
    setDispmode(mode);
  };

  const link2Detail = (tokenId, baseToken)=>{
    navigate(`/explorer/collectible/detail/${[tokenId, baseToken].join('&')}`);
  }

  const handleNavlink = (e)=>{
    const currentChain = getChainTypeFromId(pasarLinkChain)
    const path = e.target.getAttribute('to')
    if(currentChain!=='ESC' || diaBalance>=0.01)
      navigate(path)
    else
      setOpenBuyDIA(true)
  }
  const loadingSkeletons = Array(10).fill(null)

  return (
    <RootStyle title="MyProfile | PASAR">
      <Container maxWidth={false}>
        <Box sx={{ position: 'relative', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: isMobile?1:1.5 }}>
            <RingAvatar
              avatar={avatarUrl}
              isImage={!!avatarUrl}
              address={walletAddress}
              size={isMobile ? 80 : 100}
            />
          </Box>
          <Typography variant="h2" component="div" align="center" sx={{ position: 'relative', lineHeight: 1.1 }}>
            <Stack direction="row" sx={{justifyContent: 'center'}}>
              <Link to={`/explorer/transaction/detail/${walletAddress}`} component={RouterLink} color='text.primary'>
                <span role="img" aria-label="">
                  {didInfo.name || reduceHexAddress(walletAddress)}
                </span>
              </Link>
              <Stack sx={{justifyContent: 'center', alignItems: 'center'}}>
                {
                  badge.kyc&&
                  <Tooltip title="KYC-ed via kyc-me.io" arrow enterTouchDelay={0}>
                    <Box sx={{display: 'inline-flex'}} ml={2}><KYCBadge size="large"/></Box>
                  </Tooltip>
                }
              </Stack>
            </Stack>
            {
              (didInfo.name.length>0 || sessionStorage.getItem("PASAR_LINK_ADDRESS")==='2') &&
              <Stack direction='row' spacing={1} sx={{justifyContent: 'center', mt: 1.5}}>
                {
                  didInfo.name.length>0 &&
                  <AddressCopyButton address={walletAddress} />
                }
                {
                  sessionStorage.getItem("PASAR_LINK_ADDRESS")==='2' &&
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    endIcon={
                      <Icon icon={editIcon}/>
                    }
                    to='edit'
                    color='inherit'
                  >
                    Edit Profile
                  </Button>
                }
              </Stack>
            }
            {
              didInfo.description.length>0 &&
              <Typography variant="subtitle2" noWrap sx={{color: 'text.secondary', pt: 1}}>{didInfo.description}</Typography>
            }
          </Typography>
          <Box sx={{py: 1.5}}>
            <IconLinkButtonGroup {...socials}/>
          </Box>
          <Stack sx={{justifyContent: 'center'}} spacing={1} direction="row">
            {
              badge.dia>0 && <DIABadge balance={badge.dia}/>
            }
          </Stack>
          <MHidden width="smUp">
            <Stack spacing={1} pt={1} px='10px'>
              <Stack direction='row' sx={{justifyContent: 'end'}}>
                <AssetSortSelect selected={order} onChange={setOrder} sx={{flex: 1}}/>
                <ToggleButtonGroup value={dispmode} exclusive onChange={handleDispmode} size="small">
                  <ToggleButton value={0}>
                    <GridViewSharpIcon />
                  </ToggleButton>
                  <ToggleButton value={1}>
                    <AppsIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <ChainSelect selected={chainType} onChange={setChainType} sx={{width: '100%'}}/>
            </Stack>
          </MHidden>
        </Box>
        <Box sx={{ display: 'flex', position: 'relative', justifyContent: 'center' }} align="center">
          <Tabs 
            value={tabValue}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleSwitchTab}
            TabIndicatorProps={{ 
              style: { background: '#FF5082' } 
            }}
            TabScrollButtonProps={{
              sx: {
                '&.MuiTabs-scrollButtons': {
                  display: 'inherit',
                  '&.Mui-disabled': {
                    display: 'none'
                  }
                }
              }
            }}
          >
            <Tab label={`Listed (${assets[0].length})`} value={0} />
            <Tab label={`Owned (${assets[1].length})`} value={1} />
            <Tab label={`Bids (${assets[2].length})`} value={2} />
            <Tab label={`Minted (${assets[3].length})`} value={3} />
            <Tab label={`Sold (${assets[4].length})`} value={4} />
            <Tab label={`Collections (${collections.length})`} value={5} />
          </Tabs>
        </Box>
        <MHidden width="smDown">
          <Stack spacing={1} pt={1} px='10px'>
            <Stack direction='row' sx={{justifyContent: 'end'}}>
              <AssetSortSelect selected={order} onChange={setOrder}/>
              <ChainSelect selected={chainType} onChange={setChainType}/>
              <ToggleButtonGroup value={dispmode} exclusive onChange={handleDispmode} size="small">
                <ToggleButton value={0}>
                  <GridViewSharpIcon />
                </ToggleButton>
                <ToggleButton value={1}>
                  <AppsIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </MHidden>
        <Box
          sx={{
            width: '100%',
            // m: '-10px'
          }}
        >
          <SwipeableViews
            index={tabValue}
            onChangeIndex={handleSwitchSwiper}
            containerStyle={{
              transition: 'transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s'
            }}
          >
            {assets.map((group, i) => (
              <Box key={i} sx={{ minHeight: 200, p: '10px' }}>
                {/* {isLoadingAssets[i] && <LoadingScreen sx={{ background: 'transparent' }} />} */}
                {!isLoadingAssets[i]?
                  <Box component="main">
                    {
                      group.length > 0 ?
                      <AssetGrid assets={group} type={i + 1} dispmode={dispmode} myaddress={myAddress} updateCount={updateCount} handleUpdate={setUpdateCount}/>:
                      
                      <Typography variant="subtitle2" align="center" sx={{ mb: 3 }}>
                        No {typeNames[i]} collectible found!
                      </Typography>
                    }
                  </Box>:
                  <Box component="main">
                    <AssetGrid assets={loadingSkeletons} type={i + 1} dispmode={dispmode} myaddress={myAddress} updateCount={updateCount} handleUpdate={setUpdateCount}/>
                  </Box>
                }
              </Box>
            ))}
            <Box sx={{ minHeight: 200, p: '10px' }}>
              {
                !isLoadingCollection?
                <Box component="main">
                  {
                    collections.length > 0 ?
                    <Grid container spacing={2}>
                      {
                        sessionStorage.getItem("PASAR_LINK_ADDRESS")==='2' &&
                        <Grid item xs={12} sx={{display: 'flex', justifyContent: 'end'}}>
                          <Stack direction='row' spacing={2}>
                            <StyledButton variant="contained" onClick={handleNavlink} to='/collections/create'>
                              Create
                            </StyledButton>
                            <StyledButton variant="contained" onClick={handleNavlink} to='/collections/import'>
                              Import
                            </StyledButton>
                          </Stack>
                        </Grid>
                      }
                      {
                        collections.map((info, index)=>
                          <Grid item key={index} xs={12} sm={6} md={4}>
                            <CollectionCard info={info} isOwned={Boolean(true)}/>
                          </Grid>
                        )
                      }
                    </Grid>:
                    <Stack sx={{justifyContent: 'center', alignItems: 'center'}}>
                      <Typography variant="h3" align="center"> No Collections Found </Typography>
                      <Typography variant="subtitle2" align="center" sx={{ color: 'text.secondary', mb: 3 }}>We could not find any of your collections</Typography>
                      {
                        sessionStorage.getItem("PASAR_LINK_ADDRESS")==='2' &&
                        <>
                          <StyledButton variant="contained" onClick={handleNavlink} to='/collections/create' sx={{mb: 2}}>
                            Create new collection
                          </StyledButton>
                          <StyledButton variant="contained" onClick={handleNavlink} to='/collections/import'>
                            Import existing collection
                          </StyledButton>
                        </>
                      }
                    </Stack>
                  }
                </Box>:
                <Grid container spacing={2}>
                  {
                    Array(3).fill(0).map((item, index)=>(
                      <Grid item key={index} xs={12} sm={6} md={4}>
                        <CollectionCardSkeleton key={index}/>
                      </Grid>
                    ))
                  }
                </Grid>
              }
            </Box>
          </SwipeableViews>
        </Box>
      </Container>
      <NeedBuyDIADlg isOpen={buyDIAOpen} setOpen={setOpenBuyDIA} balance={diaBalance} actionText="create collections"/>
    </RootStyle>
  );
}
