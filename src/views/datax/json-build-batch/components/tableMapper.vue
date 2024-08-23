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
      }
    }
  },
  created() {
    this.getCsvHeaders()
  },
  methods: {
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
