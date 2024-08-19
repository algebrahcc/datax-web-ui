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
        <!--        <el-input v-model="readerForm.path" placeholder="" style="width: 42%">{{ readerForm.path }}</el-input>-->
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
      <template v-for="(item,i) in this.readerForm.columns">
        <el-form-item :label="item.value" style="">
          <el-autocomplete
            v-model="item.type"
            placeholder="请输入或选择数据类型"
            :fetch-suggestions="querySearch"
            @select="handleSelect(item)"
          >
          </el-autocomplete>
        </el-form-item>
      </template>
<!--          <el-select v-model="item.type" placeholder="选择数据类型" style="width: 150px;">-->
<!--            <el-option-->
<!--              v-for="item in typeList"-->
<!--              :key="item.value"-->
<!--              :label="item.key"-->
<!--              :value="item.label"-->
<!--            />-->

<!--          </el-select>-->

      <el-form-item label="skipHeader">
        <el-select v-model="readerForm.skipHeader" placeholder="是否跳过表头" style="width: 150px;">
          <el-option v-for="item in skipHeaderTypes" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
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
        skipHeader: ''
      },
      folderPath: '',
      selectedFile: '',
      typeList:[
        {
          value:'long',
          address:'整型'
        },
        {
          value:'double',
          address:'浮点型'
        },
        {
          value: 'boolean',
          address: '布尔值'
        },
        {
          value: 'string',
          address: '字符串'
        },
        {
          value: 'date',
          address: '日期'
        }
      ],
      // typeList: [
      //   {
      //     value: 0,
      //     label: 'long',
      //     key: '整数'
      //   },
      //   {
      //     value: 1,
      //     label: 'double',
      //     key: '浮点数'
      //   },
      //   {
      //     value: 2,
      //     label: 'boolean',
      //     key: '布尔值'
      //   },
      //   {
      //     value: 3,
      //     label: 'string',
      //     key: '字符串'
      //   },
      //   {
      //     value: 4,
      //     label: 'date',
      //     key: '日期'
      //   }
      // ],
      rules: {
        datasourceId: [{required: true, message: '此项必填', trigger: 'change'}],
        path: [{required: true, message: '此项必填', trigger: 'change'}],
        fieldDelimiter: [{required: true, message: '此项必填', trigger: 'change'}],
        skipHeader: [{require: true, message: '此项必填', trigger: 'change'}]
      },
      skipHeaderTypes: [
        {value: 'true', label: '读取跳过表头'},
        {value: 'false', label: '读取包含表头'}
      ]
    }
  },
  watch: {
    'folderPath': function (val) {
      this.getFileList()
    },
    'fileList': function (val) {
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

    querySearch(queryString,cb) {
      const typeList = this.typeList;
      const results = queryString ? typeList.filter(this.createFilter(queryString)) : typeList;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },

    createFilter(queryString) {
      return (typeList) => {
        return (typeList.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },

    handleSelect(item){
      console.log(item)
    },
    fileChange() {
      axios.post('http://localhost:8080/api/getCsvHeader', {
        path: this.readerForm.path
      })
        .then(res => {
          if (res.data.code === 0) {
            this.csvHeader = []
            this.csvHeader = res.data.data
            // 表格源文件变化时，列名清空
            this.readerForm.columns = []
            this.csvHeader.forEach((item, i) => {
              this.readerForm.columns.push({
                index: i.toString(),
                type: '',
                value: item
              })
            })
          } else {
            this.$notify({
              title: 'Error',
              message: '文件处理失败: ' + res.data.message,
              type: 'error',
              duration: 2000
            });
          }
        }).catch(err => {
        console.error(err)
        this.$notify({
          title: 'Error',
          message: '文件处理失败',
          type: 'error',
          duration: 2000
        });
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
