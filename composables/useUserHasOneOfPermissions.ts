import { userHasOneOfPermissions } from '~/utilities/auth.util'
import { UserI } from '~/types/user'

// eslint-disable-next-line import/prefer-default-export
export const useUserHasOneOfPermissions = (permissions: string[]) => {
  const { data } = useAuth()
  const currentUser = data.value as UserI

  if (!currentUser) {
    return false
  }
  return userHasOneOfPermissions(currentUser, permissions)
}
