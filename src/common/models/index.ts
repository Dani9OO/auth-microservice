import { getModelForClass } from '@typegoose/typegoose'
import { Module } from '../../module/module.model'
import { Permission } from '../../permissions/permission.model'
import { Role } from '../../role/role.model'
import { Service } from '../../service/service.model'
import { User } from '../../user/user.model'
import { Policy } from '../../policy/policy.model'
import { ServiceUser } from '../../service/service-user.model'
import { RefreshToken } from '../../user/refresh-token.model'

export const ModuleModel = getModelForClass(Module)

export const PermissionModel = getModelForClass(Permission)

export const PolicyModel = getModelForClass(Policy)

export const RoleModel = getModelForClass(Role)

export const ServiceModel = getModelForClass(Service)

export const ServiceUserModel = getModelForClass(ServiceUser)

export const UserModel = getModelForClass(User)

export const RefreshTokenModel = getModelForClass(RefreshToken)
