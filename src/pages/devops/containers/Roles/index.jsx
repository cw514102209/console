/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import { toJS } from 'mobx'
import { Avatar } from 'components/Base'
import Banner from 'components/Cards/Banner'
import withList, { ListPage } from 'components/HOCs/withList'
import Table from 'components/Tables/List'

import { getLocalTime } from 'utils'
import { ICON_TYPES } from 'utils/constants'

import RoleStore from 'stores/role'

@withList({
  store: new RoleStore(),
  module: 'roles',
  name: 'DevOps Role',
  injectStores: ['rootStore', 'devopsStore'],
})
export default class Secrets extends React.Component {
  componentDidMount() {
    this.props.store.fetchRoleTemplates({
      devops: this.devopsName,
      cluster: this.cluster,
    })
  }

  showAction = record => !globals.config.presetRoles.includes(record.name)

  get prefix() {
    if (this.props.match.url.endsWith('/')) {
      return this.props.match.url
    }
    return this.props.match.url
  }

  get devopsName() {
    return this.props.devopsStore.project_name
  }

  get cluster() {
    return this.props.match.params.cluster
  }

  get itemActions() {
    const { routing, trigger, store } = this.props

    return [
      {
        key: 'edit',
        icon: 'pen',
        text: t('Edit'),
        action: 'edit',
        onClick: item =>
          trigger('resource.baseinfo.edit', {
            detail: item,
          }),
      },
      {
        key: 'editRole',
        icon: 'pen',
        text: t('Edit Authorization'),
        action: 'edit',
        show: this.showAction,
        onClick: item =>
          trigger('role.edit', {
            module: 'devopsroles',
            detail: item,
            roleTemplates: toJS(store.roleTemplates.data),
            success: routing.query,
          }),
      },
      {
        key: 'delete',
        icon: 'trash',
        text: t('Delete'),
        action: 'delete',
        show: this.showAction,
        onClick: item =>
          trigger('role.delete', {
            detail: item,
            type: t(this.name),
            success: routing.query,
          }),
      },
    ]
  }

  get tableActions() {
    const { tableProps } = this.props
    return {
      ...tableProps.tableActions,
      onCreate: this.showCreate,
      getCheckboxProps: record => ({
        disabled: !this.showAction(record),
        name: record.name,
      }),
    }
  }

  getData = () => {
    this.props.store.fetchList({
      devops: this.devopsName,
      cluster: this.cluster,
    })
  }

  getColumns = () => {
    const { getSortOrder, module } = this.props
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
        sorter: true,
        sortOrder: getSortOrder('name'),
        search: true,
        render: name => (
          <Avatar
            icon={ICON_TYPES[module]}
            title={name}
            to={`${this.prefix}/${name}`}
          />
        ),
      },
      {
        title: t('Description'),
        key: 'description',
        dataIndex: 'description',
        isHideable: true,
        width: '40%',
        render: (description, record) => {
          const name = record.name
          if (description && globals.config.presetRoles.includes(name)) {
            return t(description)
          }
          return description
        },
      },
      {
        title: t('Created Time'),
        dataIndex: 'createTime',
        sorter: true,
        sortOrder: getSortOrder('createTime'),
        isHideable: true,
        width: 150,
        render: time => getLocalTime(time).format('YYYY-MM-DD HH:mm:ss'),
      },
    ]
  }

  showCreate = () =>
    this.props.trigger('role.create', {
      module: 'devopsroles',
      devops: this.devopsName,
      cluster: this.cluster,
      roleTemplates: toJS(this.props.store.roleTemplates.data),
      success: this.getData,
    })

  get emptyProps() {
    return { desc: t('DEVOPS_PROJECT_ROLES_DESC') }
  }

  render() {
    const { bannerProps, tableProps } = this.props
    return (
      <ListPage {...this.props} getData={this.getData}>
        <Banner
          {...bannerProps}
          tabs={this.tabs}
          description={t('DEVOPS_PROJECT_ROLES_DESC')}
        />
        <Table
          {...tableProps}
          emptyProps={this.emptyProps}
          tableActions={this.tableActions}
          itemActions={this.itemActions}
          columns={this.getColumns()}
        />
      </ListPage>
    )
  }
}
