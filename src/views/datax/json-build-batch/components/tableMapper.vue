<template>
  <div class="app-container">
    <el-form label-position="left" label-width="80px" :model="readerForm">
      <el-form-item label="源端表">
<!--        <span v-for="item in fromTablesList">-->
<!--          {{item}}-->
<!--        </span>-->

        <el-checkbox
          v-model="readerForm.lcheckAll"
          :indeterminate="readerForm.isIndeterminate"
          @change="lHandleCheckAllChange"
        >全选</el-checkbox>
        <div style="margin: 15px 0;" />
        <el-checkbox-group v-model="readerForm.ltables" @change="lHandleCheckedChange">
          <el-checkbox v-for="c in fromTablesList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-divider></el-divider>
      <template v-for="(item,index) in fromTablesList">
        <el-form-item label="表名">
          {{item}}
        </el-form-item>
<!--        <template v-for="(item,i) in this.readerForm.columnsList[index]">-->
          <el-form-item v-for="(columnItem, columnIndex) in readerForm.columnsList[index]" :label="columnItem.value" style="">
            <el-autocomplete
              v-model="item.type"
              placeholder="请输入或选择数据类型"
              :fetch-suggestions="querySearch"
            >
            </el-autocomplete>
          </el-form-item>
<!--        </template>-->
        <el-divider></el-divider>
      </template>
      <el-form-item label="目标表">
        <el-checkbox
          v-model="readerForm.rcheckAll"
          :indeterminate="readerForm.isIndeterminate"
          @change="rHandleCheckAllChange"
        >全选</el-checkbox>
        <div style="margin: 20px 0;" />
        <el-checkbox-group v-model="readerForm.rtables" @change="rHandleCheckedChange">
          <el-checkbox v-for="c in toTablesList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'TableMapper',
  data() {
    return {
      type:[],
      mapperJson: {},
      fromTablesList: [],
      toTablesList: [],
      readerForm: {
        ltables: [],
        rtables: [],
        // 用来存放不同地址的columns属性，index与fromTablesList相同
        columnsList:[],
        lcheckAll: false,
        rcheckAll: false,
        isIndeterminate: true
      },
      csvHeaders:[],
      typeList:[
        {
          value:'long',
        },
        {
          value:'double',
        },
        {
          value: 'boolean',
        },
        {
          value: 'string',
        },
        {
          value: 'date',
        }
      ],
    }
  },
  created() {
    this.getCsvHeaders()
  },
  watch:{
    'fromTableList':function (){
      this.getCsvHeaders()
    },
    // 'readerForm.columnsList':function (){
    //   for (let i = 0; i < this.readerForm.columnsList.length; i++) {
    //     this.type.push([])
    //     for (let j = 0; j < this.readerForm.columnsList[i].length; j++) {
    //       this.type[i].push('')
    //     }
    //   }
    // }
  },
  methods: {

    handleQueryChange(index,columnIndex){
      this.readerForm.columnsList[index][columnIndex].type=this.type[index][columnIndex]
      console.log(this.readerForm.columnsList)
    },

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

    getCsvHeaders(){

      this.fromTablesList.forEach((item,index)=>{
        axios.post('http://localhost:8080/api/getCsvHeader', {
          path: item
        })
          .then(res => {
            if (res.data.code === 0) {
              //
              this.csvHeaders.push(res.data.data)
              // 表格源文件变化时，列名清空
              this.readerForm.columnsList[index]=[]
              this.csvHeaders[index].forEach((item, i) => {
                this.$set(this.readerForm.columnsList[index],i,{
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
          })
      })
      console.log(this.readerForm.columnsList)
      for (let i = 0; i < this.readerForm.columnsList.length; i++) {
        this.type.push([])
        for (let j = 0; j < this.readerForm.columnsList[i].length; j++) {
          this.type[i].push('')
        }
      }
    },

    lHandleCheckAllChange(val) {
      this.readerForm.ltables = val ? this.fromTablesList : []
      this.readerForm.isIndeterminate = false
    },
    rHandleCheckAllChange(val) {
      this.readerForm.rtables = val ? this.toTablesList : []
      this.readerForm.isIndeterminate = false
    },
    lHandleCheckedChange(value) {
      const checkedCount = value.length
      this.readerForm.checkAll = checkedCount === this.fromTablesList.length
      this.readerForm.isIndeterminate = checkedCount > 0 && checkedCount < this.fromTablesList.length
    },
    rHandleCheckedChange(value) {
      const checkedCount = value.length
      this.readerForm.checkAll = checkedCount === this.toTablesList.length
      this.readerForm.isIndeterminate = checkedCount > 0 && checkedCount < this.toTablesList.length
    },
    getLTables() {
      return this.readerForm.ltables
    },
    getRTables() {
      return this.readerForm.rtables
    },
    getColumnsList(){
      return this.readerForm.columnsList
    }
  }
}
</script>
