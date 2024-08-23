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
      <el-form-item label="文件夹路径" prop="path">
        {{ this.getPath() }}
      </el-form-item>
      <el-form-item label="选中表格">
        <el-select v-model="readerForm.path" placeholder="选择表格" style="width: 150px;" @change="fileChange">
          <el-option v-for="item in fileListOptions"
                     :key="item.key"
                     :label="item.value"
                     :value="folderPath+'\\'+item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!--      <el-form-item label="字段分隔符" prop="fieldDelimiter">-->
      <!--        <el-input v-model="readerForm.fieldDelimiter" placeholder="CSV字段分隔符" style="width: 150px"/>-->
      <!--      </el-form-item>-->
      <template v-for="(item,i) in csvHeader">
        <el-form-item :label="item">
          <AutoComplete v-model="readerForm.columns[i].type"
                        :data="['long','double','boolean','string','date']"
                        :filter-method="filterMethod"
                        style="width: 150px;">
          </AutoComplete>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script>
import {list as jdbcDsList} from '@/api/datax-jdbcDatasource'
import Bus from '../busReader'
import axios from "axios";
import * as jdbcDatasource from "@/api/datax-jdbcDatasource";

export default {
  name: 'TxtfileReader',
  data() {
    return {
      dialogVisible: false,
      jdbcDsQuery: {
        current: 1,
        size: 200,
        ascs: 'datasource_name'
      },
      csvHeader: [],
      fileList: [],
      fileListOptions: [],
      rDsList: [],
      rTbList: [],
      schemaList: [],
      rColumnList: [],
      loading: false,
      active: 1,
      customFields: '',
      customType: '',
      customValue: '',
      dataSource: '',
      readerForm: {
        tableName: '',
        datasourceId: undefined,
        columns: [],
        checkAll: false,
        isIndeterminate: true,
        fieldDelimiter: ',',
        path: '',
        skipHeader: 'true'
      },
      folderPath: '',
      selectedFile: '',
      rules: {
        datasourceId: [{required: true, message: '此项必填', trigger: 'change'}],
        path: [{required: true, message: '此项必填', trigger: 'change'}],
        fieldDelimiter: [{required: true, message: '此项必填', trigger: 'change'}],
        skipHeader: [{require: true, message: '此项必填', trigger: 'change'}]
      },
    }
  },
  watch: {
    'folderPath': function () {
      this.getFileList()
    },
    'fileList': function () {
      this.fileListOptions = []
      for (let i = 0; i < this.fileList.length; i++) {
        this.fileListOptions.push({
          key: i,
          value: this.fileList[i]
        })
      }
      console.log(this.fileListOptions)
    }
  },
  created() {
    this.getJdbcDs()
  },
  methods: {

    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },

    fileChange() {
      jdbcDatasource.getCsvHeader({path: this.readerForm.path}).then(res => {
        this.csvHeader = []
        this.csvHeader = res
        // 表格源文件变化时，列名清空
        this.readerForm.columns = []
        this.csvHeader.forEach((item, i) => {
          this.readerForm.columns.push({
            index: i.toString(),
            type: 'string',
            value: item
          })
        })
      })
    },

    getFileList() {
      jdbcDatasource.getFileList({folderPath: this.folderPath}).then(res => {
        this.fileList = []
        this.fileList = res
        console.log(res)
      })
    },
    getPath() {
      const selectedDataSource = this.rDsList.find(item => item.id === this.readerForm.datasourceId)
      if (selectedDataSource) {
        this.folderPath = selectedDataSource.fileAddress
      }
      return this.folderPath
    },
    // 获取可用数据源
    getJdbcDs(type) {
      this.loading = true
      jdbcDsList(this.jdbcDsQuery).then(response => {
        const {records} = response
        this.rDsList = records
        this.loading = false
        console.log(this.rDsList)
      })
    },
    // 获取表名

    // reader 数据源切换
    rDsChange(e) {
      // 清空
      console.log(e)
      this.readerForm.datasourceId = e
      const selectedDataSource = this.rDsList.find(item => item.id === e)
      if (selectedDataSource) {
        this.dataSource = selectedDataSource.datasource
        this.folderPath = selectedDataSource.fileAddress
      }
      console.log(this.folderPath)
      Bus.dataSourceId = e
      this.$emit('selectDataSource', this.dataSource)
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
