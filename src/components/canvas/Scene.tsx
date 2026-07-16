import Lighting from './Lighting'
import CameraRig from './CameraRig'
import Model from './Model'
import PostFX from './PostFX'

export default function Scene() {
  return (
    <>
      <Lighting />
      <CameraRig />
      <Model />
      <PostFX />
    </>
  )
}
