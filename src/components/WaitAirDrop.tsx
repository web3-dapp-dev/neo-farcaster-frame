'use client'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useGetRewardMutation } from '@/composables/api'
import sdk, { FrameContext } from '@farcaster/frame-sdk'
import { useEffect, useState } from 'react'
import { message } from 'antd'
import AccountUrlDisplayer from './ui/AccountUrlDisplayer'
import { useAccount } from 'wagmi'
import './WaitAirDrop.css'
import Congratulations from './Congradulations'
import InfoDialog from './ui/InfoDialog'

export default function Wait() {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [claim, setClaim] = useState(false)
  const [context, setContext] = useState<FrameContext>()
  const { mutateAsync: GetReward } = useGetRewardMutation()
  useEffect(() => {
    const load = async () => {
      setContext(await sdk.context)
    }
    load()
  }, [])
  const [messageApi, contextHolder] = message.useMessage()
  const recast = () => {
    setLoading(true)
    GetReward({ fid: context?.user.fid + '' }).then((res) => {
      setLoading(false)
      if (res.code === 1) {
        if (res.data.status === 4) {
          router.push('/rank')
        } else if (res.data.status === 2 || res.data.status === 3) {
          setClaim(true)
        } else if (res.data.status === 1) {
          messageApi.info('To be reviewed')
        }
      }
    })
  }
  return (
    <>
      <>{contextHolder}</>
      {!claim && (
        <div className="WaitPage-Displayer">
          <AccountUrlDisplayer text={address || ''} />
        </div>
      )}

      <div className={'WaitPage-Main px-10 py-28 flex justify-center items-center gap-2 flex-col' + (claim ? ' hidden' : '')}>
        <h1 className='text-5xl'>🤩</h1>
        <h1 className='text-3xl font-bold'>Wait for Airdrop!</h1>
        <p className='max-w-[85%] text-[#C7C7C7] font-bold'>You have successfully submitted and are awaiting confirmation.</p>
        {/* <Spin className='text-base font-bold' tip="wait..."></Spin> */}
        <Button
          isLoading={loading}
          onClick={recast}
          className="px-16 max-md:px-10"
        >
          Refresh status
        </Button>
      </div>

      <InfoDialog emoji='🥳' isOpen={claim} onClose={() => setClaim(false)}>
        <Congratulations />
      </InfoDialog>
    </>
  )
}