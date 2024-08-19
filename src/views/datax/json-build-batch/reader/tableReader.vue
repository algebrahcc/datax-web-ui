<template>
  <div class="app-container">
    <el-form label-position="right" label-width="120px" :model="readerForm" :rules="rules">
      <el-form-item label="数据库源：" prop="datasourceId">
        <el-select v-model="readerForm.datasourceId" filterable style="width: 300px" @change="rDsChange">
          <el-option
            v-for="item in rDsList"
            :key="item.id"
            :label="item.datasourceName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="dataSource==='postgresql' || dataSource==='oracle' ||dataSource==='sqlserver'"
                    label="Schema：">
        <el-select v-model="readerForm.tableSchema" filterable style="width: 300px" @change="schemaChange">
          <el-option
            v-for="item in schemaList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="dataSource==='txtfile'" label="文件夹地址：">
        <span>{{ getPath() }}</span>
      </el-form-item>
      <el-form-item v-show="fileList" label="文件名称：">
        <el-checkbox
          v-model="readerForm.checkAll"
          :indeterminate="readerForm.isIndeterminate"
          @change="rHandleCheckAllChange"
        >全选
        </el-checkbox>
        <div style="margin: 15px 0;"/>
        <el-checkbox-group v-model="readerForm.tables" @change="rHandleCheckedChange">
          <el-checkbox v-for="c in fileList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item v-show="readerForm.tables" label="选择字段数据类型">
        <el-form-item v-for="(item,index) in readerForm.tables" :key="index">
          <el-checkbox
            v-model="readerForm.tableCheckAll"
            :indeterminate="readerForm.tableIsIndeterminate"
            @change="lHandleCheckAllChange"
          >全选</el-checkbox>
          <div style="margin: 15px 0;" />
          <el-checkbox-group v-model="readerForm.ltables" @change="lHandleCheckedChange">
            <el-checkbox v-for="c in fromTablesList" :key="c" :label="c">{{ c }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form-item>
<!--      checkbox的值变化时,colums记得清空-->

      <!--      <el-form-item label="切分字段：">-->
      <!--        <el-input v-model="readerForm.splitPk" placeholder="切分主键" style="width: 13%" />-->
      <!--      </el-form-item>-->
      <el-form-item v-show="dataSource==='postgresql' || dataSource==='oracle' ||dataSource==='sqlserver'"
                    label="数据库表名：">
        <el-checkbox
          v-model="readerForm.checkAll"
          :indeterminate="readerForm.isIndeterminate"
          @change="rHandleCheckAllChange"
        >全选
        </el-checkbox>
        <div style="margin: 15px 0;"/>
        <el-checkbox-group v-model="readerForm.tables" @change="rHandleCheckedChange">
          <el-checkbox v-for="c in rTbList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as dsQueryApi from '@/api/metadata-query'
import {list as jdbcDsList} from '@/api/datax-jdbcDatasource'
import Bus from '../busReader'
import axios from "axios";

export default {
  name: 'TableReader',
  data() {
    return {
      jdbcDsQuery: {
        current: 1,
        size: 200,
        ascs: 'datasource_name'
      },
      folderPath: '',
      fileList: [],
      rDsList: [],
      rTbList: [],
      schemaList: [],
      loading: false,
      active: 1,
      customFields: '',
      customType: '',
      customValue: '',
      dataSource: '',
      readerForm: {
        datasourceId: undefined,
        tables: [],
        checkAll: false,
        tableCheckAll: false,
        isIndeterminate: true,
        tableIsIndeterminate: true,
        splitPk: '',
        tableSchema: '',
        paths: [],
        columns:[],
      },
      rules: {
        datasourceId: [{required: true, message: 'this is required', trigger: 'change'}],
        tableName: [{required: true, message: 'this is required', trigger: 'change'}]
      }
    }
  },
  watch: {
    'readerForm.datasourceId': function (oldVal, newVal) {
      if (this.dataSource === 'postgresql' || this.dataSource === 'oracle' || this.dataSource === 'sqlserver') {
        this.getSchema()
      } else {
        this.getTables('reader')
      }
    },
    'folderPath': function () {
      this.getFileList()
    }
  },
  created() {
    this.getJdbcDs()
  },
  methods: {
    // 获取可用数据源
    getJdbcDs() {
      this.loading = true
      jdbcDsList(this.jdbcDsQuery).then(response => {
        const {records} = response
        this.rDsList = records
        this.loading = false
      })
    },
    getFileList() {
      axios.get('http://localhost:8080/api/getFileList', {
        params:
          {
            folderPath: this.folderPath
          }
      }).then(res => {
        this.fileList = []
        this.fileList = res.data.data
        for (let i = 0; i < this.fileList.length; i++) {
          this.fileList[i]=this.folderPath+'\\'+this.fileList[i]
        }
        console.log(res.data.data)
      })
    },
    getPath() {
      const selectedDataSource = this.rDsList.find(item => item.id === this.readerForm.datasourceId)
      if (selectedDataSource) {
        this.folderPath = selectedDataSource.fileAddress
      }
      return this.folderPath
    },
    // 获取表名
    getTables(type) {
      if (type === 'reader') {
        let obj = {}
        if (this.dataSource === 'postgresql' || this.dataSource === 'oracle' || this.dataSource === 'sqlserver') {
          obj = {
            datasourceId: this.readerForm.datasourceId,
            tableSchema: this.readerForm.tableSchema
          }
        } else {
          obj = {
            datasourceId: this.readerForm.datasourceId
          }
        }
        // 组装
        dsQueryApi.getTables(obj).then(response => {
          if (response) {
            this.rTbList = response
          }
        })
      }
    },
    getSchema() {
      const obj = {
        datasourceId: this.readerForm.datasourceId
      }
      dsQueryApi.getTableSchema(obj).then(response => {
        this.schemaList = response
      })
    },
    // schema 切换
    schemaChange(e) {
      this.readerForm.tableSchema = e
      // 获取可用表
      this.getTables('reader')
    },
    // reader 数据源切换
    rDsChange(e) {
      // 清空
      this.readerForm.tableName = ''
      this.readerForm.datasourceId = e
      this.rDsList.find((item) => {
        if (item.id === e) {
          this.dataSource = item.datasource
        }
      })
      Bus.dataSourceId = e
      this.$emit('selectDataSource', this.dataSource)
      // 获取可用表
      this.getTables('reader')
    },
    rHandleCheckAllChange(val) {
      if (this.dataSource === 'txtfile') {
        this.readerForm.paths = val ? this.fileList : []
      } else {
        this.readerForm.tables = val ? this.rTbList : []
      }
      this.readerForm.isIndeterminate = false
    },
    rHandleCheckedChange(value) {
      const checkedCount = value.length
      this.readerForm.checkAll = checkedCount === this.fileList.length
      this.readerForm.isIndeterminate = checkedCount > 0 && checkedCount < this.fileList.length
    },
    getData() {
      if (Bus.dataSourceId) {
        this.readerForm.datasourceId = Bus.dataSourceId
      }
      return this.readerForm
    }
  }
}
</script>
