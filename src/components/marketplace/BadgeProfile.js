import React, { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Box, Stack, Typography, Menu, Popover, Popper, Tooltip, Link, Fade, SvgIcon, Avatar } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BoltIcon from '@mui/icons-material/Bolt';
import { Icon } from '@iconify/react';

import Badge from '../badge/Badge';
import KYCBadge from '../badge/KYCBadge';
import DIABadge from '../badge/DIABadge';
import Jazzicon from '../Jazzicon';
import RingAvatar from '../RingAvatar';
import IconLinkButtonGroup from '../collection/IconLinkButtonGroup'
import { queryAvatarUrl, queryName, queryDescription, queryWebsite, queryTwitter, queryDiscord, queryTelegram, queryMedium, queryKycMe, downloadAvatar } from '../signin-dlg/HiveAPI'
import { downloadFromUrl } from '../signin-dlg/HiveService'
import { getUserCredentials } from '../signin-dlg/LoadCredentials';
import { reduceHexAddress, getDidInfoFromAddress, collectionTypes, getDiaTokenInfo, getContractAddressInCurrentNetwork } from '../../utils/common';
import useSingin from '../../hooks/useSignin';

// ----------------------------------------------------------------------

const AvatarBoxStyle = {
  width: 70,
  height: 70,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '100%',
  background: (theme)=>
    `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box, linear-gradient(180deg, #a951f4, #FF5082) border-box`,    
  border: '2px solid transparent'
}

const DescriptionStyle = {
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: '-webkit-box !important',
  fontWeight: 'normal',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  lineHeight: 1.2
}

const queryProfileSocials = {
  website: queryWebsite,
  twitter: queryTwitter,
  discord: queryDiscord,
  telegram: queryTelegram,
  medium: queryMedium
}
// const socialTypes = [ 'website', 'twitter', 'discord', 'telegram', 'medium' ]

export default function BadgeProfile(props) {
  const {type, walletAddress, collection={}, reservePriceFlag=false, hasBuynow=false, defaultCollectionType=0} = props
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [didInfo, setDidInfo] = useState({name: '', description: ''});
  const [avatarUrl, setAvatarUrl] = React.useState(null);
  const [badge, setBadge] = React.useState({dia: 0, kyc: false});
  const [socials, setSocials] = React.useState({});
  const { pasarLinkChain } = useSingin()
  const PasarContractAddress = getContractAddressInCurrentNetwork(pasarLinkChain, 'sticker')

  const defaultCollection = {
    ...collectionTypes[defaultCollectionType],
    token: PasarContractAddress,
    description: collectionTypes[defaultCollectionType].shortDescription
  }

  useEffect(()=>{
    let isMounted = true;
    if(walletAddress) {
      getDidInfoFromAddress(walletAddress)
        .then((info) => {
          if(isMounted){
            setDidInfo({'name': info.name || '', 'description': info.description || ''})
            if(sessionStorage.getItem('PASAR_LINK_ADDRESS') === '2')
              fetchProfileData(info.did, {name: info.name || '', bio: info.description || ''})
          }
        })
      
      getDiaTokenInfo(walletAddress)
        .then(dia=>{
          if(dia!=='0')
            setBadgeFlag('dia', dia)
          else setBadgeFlag('dia', 0)
        })
    }
    return () => { isMounted = false };
  }, [walletAddress])
  
  const handlePopoverOpen = (event) => {
    if (isMobile && event.type === 'mouseenter') return;
    setAnchorEl(event.currentTarget)
    setOpen(true);
  };
  const handlePopoverClose = () => {
    setOpen(false);
  };

  const {avatar, token, marketPlace=1} = collection || defaultCollection
  let {name, description} = collection || defaultCollection
  let dispAddress = reduceHexAddress(token)
  if(type===2){
    name = didInfo.name || reduceHexAddress(walletAddress)
    dispAddress = didInfo.name?reduceHexAddress(walletAddress):''
    description = didInfo.description
  }

  const fetchProfileData = (targetDid, didInfo)=>{
    // getUserCredentials(targetDid)
    //   .then(credentials => {
    //     if(!credentials)
    //       return

    //     if(credentials.name)
    //       setDidInfoValue('name', credentials.name);
    //     else setDidInfoValue('name', didInfo.name);

    //     if(credentials.description)
    //       setDidInfoValue('description', credentials.description);
    //     else setDidInfoValue('description', didInfo.bio);

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
          setDidInfoValue('name', didInfo.name)

        queryDescription(targetDid).then((res)=>{
          if(res.find_message && res.find_message.items.length)
            setDidInfoValue('description', res.find_message.items[0].display_name)
          else
            setDidInfoValue('description', didInfo.bio)
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

  const setDidInfoValue = (field, value)=>{
    setDidInfo((prevState)=>{
      const tempState = {...prevState}
      tempState[field] = value
      return tempState
    })
  }

  const setBadgeFlag = (type, value) => {
    setBadge((prevState) => {
      const tempFlag = {...prevState}
      tempFlag[type] = value
      return tempFlag
    })
  }
  
  const badgeAction = type>=3?{}:{
    onClick: handlePopoverOpen,
    onMouseEnter: handlePopoverOpen,
    onMouseLeave: handlePopoverClose
  }
  
  return (
    <>
      <Box {...badgeAction}>
        {
          type===1&&
          <>
            {
              !collection?
              <Box sx={{ width: 26, height: 26, borderRadius: 2, p: '6px', backgroundColor: 'black', display: 'flex' }}>
                <Box draggable = {false} component="img" src={avatar} sx={{ width: 24, borderRadius: '100%', p: '2px', background: (theme)=>theme.palette.origin.main }} />
              </Box>:

              <Box sx={{ width: 26, height: 26, borderRadius: 2, backgroundColor: 'black', display: 'flex', overflow: 'hidden' }}>
                <Box draggable = {false} component="img" src={avatar} sx={{ width: 26 }} />
              </Box>
            }
          </>
        }
        {
          type===2&&
          <>
            {
              avatarUrl?
              <Avatar alt="user" src={avatarUrl} sx={{width: 26, height: 26, display: 'inline-flex'}} />:
              <Jazzicon address={walletAddress} size={26} sx={{mr: 0}}/>
            }
          </>
        }
        {
          type===3&&
          <Tooltip title={`Reserve Price ${reservePriceFlag?'Met':'Not Met'}`} arrow enterTouchDelay={0}>
            <Box sx={{ width: 26, height: 26, borderRadius: 2, p: '5px', backgroundColor: reservePriceFlag?'#7CB342':'#D60000', display: 'flex' }}>
              <SvgIcon sx={{fontSize: 18, color:'success.contrastText'}}>
                <ShoppingCartIcon/>
              </SvgIcon>
            </Box>
          </Tooltip>
        }
        {
          type===4&&
          <Tooltip title="Has Buy Now" arrow enterTouchDelay={0}>
            <Box sx={{ width: 26, height: 26, borderRadius: 2, p: '2px', backgroundColor: '#F6D31B', display: 'flex' }}>
              <SvgIcon sx={{fontSize: 22, color:'success.contrastText'}}>
                <BoltIcon/>
              </SvgIcon>
            </Box>
          </Tooltip>
        }
      </Box>
      <Popper
        open={open}
        anchorEl={anchorEl}
        onMouseEnter={()=>{setOpen(true)}}
        onMouseLeave={()=>{setOpen(false)}}
        placement="bottom-start"
        transition
      >
        {
          ({ TransitionProps }) => (
            <Fade {...TransitionProps}>
              <Stack sx={{minWidth: 180, p: 2, alignItems: 'center', borderRadius: 1, boxShadow: (theme) => theme.customShadows.z12, background: (theme) => theme.palette.background.paper}}>
                <Box sx={{...AvatarBoxStyle}}>
                  {
                    type===1&&
                    <>
                      {
                        collection?
                        <Link to={`/collections/detail/${marketPlace}${token}`} component={RouterLink} color='text.primary'>
                          <Box sx={{ backgroundColor: 'black', borderRadius: '100%', width: 60, height: 60, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                            <Box draggable = {false} component="img" src={avatar} sx={{ width: avatar&&avatar.startsWith('/static')?35:60 }} />
                          </Box>
                        </Link>:

                        <Box sx={{ backgroundColor: 'black', borderRadius: '100%', width: 60, height: 60, p: 2 }}>
                          <Box 
                            draggable = {false}
                            component="img"
                            src={avatar} 
                            sx={{ 
                              width: '100%',
                              height: '100%',
                              background: (theme)=>theme.palette.origin.main, 
                              borderRadius: '100%', 
                              p: .5 
                            }} />
                        </Box>
                      }
                    </>
                  }
                  {
                    type===2&&
                    <Link to={`/profile/others/${walletAddress}`} component={RouterLink} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <RingAvatar
                        avatar={avatarUrl}
                        isImage={!!avatarUrl}
                        address={walletAddress}
                        size={60}
                      />
                    </Link>
                  }
                </Box>
                {
                  type===1?
                  <>
                    {
                      collection?
                      <Link to={`/collections/detail/${marketPlace}${token}`} component={RouterLink} color='text.primary'>
                        <Typography variant='h5' sx={{ pt: 2 }}>{name}</Typography>
                      </Link>:
                      <Typography variant='h5' sx={{ pt: 2 }}>{name}</Typography>
                    }
                  </>:

                  <Stack direction="row" sx={{justifyContent: 'center', pt: 2, pb: 1}} spacing={1}>
                    <Link to={`/profile/others/${walletAddress}`} component={RouterLink} color='text.primary'>
                      <Typography variant='h5'>{name}</Typography>
                    </Link>
                    <Stack sx={{justifyContent: 'center', alignItems: 'center'}}>
                      {
                        badge.kyc&&
                        <Tooltip title="KYC-ed via kyc-me.io" arrow enterTouchDelay={0}>
                          <Box><KYCBadge/></Box>
                        </Tooltip>
                      }
                    </Stack>
                  </Stack>
                }
                {
                  dispAddress&&(
                    type===1?
                    <Typography variant='subtitle2' sx={{fontWeight: 'normal', display: 'flex', alignItems: 'center'}}>
                      <Icon icon="teenyicons:contract-outline" width="14px" style={{marginRight: 4}}/>{dispAddress}
                    </Typography>:

                    <Link to={`/profile/others/${walletAddress}`} component={RouterLink} color='text.primary'>
                      <Typography variant='subtitle2' sx={{fontWeight: 'normal', fontSize: '0.925em'}}>{dispAddress}</Typography>
                    </Link>
                  )
                }
                {
                  description&&
                  <Typography variant='subtitle2' sx={{fontWeight: 'normal', color: 'text.secondary', pt: 2, lineHeight: 1, fontSize: '0.925em', maxWidth: 270, ...DescriptionStyle}}>{description}</Typography>
                }
                {
                  type===2 && Object.keys(socials).length>0 && 
                  <Box sx={{pt: 1.5}}>
                    <IconLinkButtonGroup {...socials}/>
                  </Box>
                }
                {
                  type===2&&
                  <Stack spacing={.5} direction="row" sx={{justifyContent: 'center', pt: (badge.dia>0)?2:0}}>
                    {
                      badge.dia>0 && <DIABadge balance={badge.dia}/>
                    }
                  </Stack>
                }
              </Stack>
            </Fade>
          )
        }
      </Popper>
    </>
  )
}