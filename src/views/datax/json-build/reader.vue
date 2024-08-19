<template>
  <div class="app-container">
    <RDBMSReader v-show="dataSource!=='hive' && dataSource!=='hbase' && dataSource!=='mongodb'&&dataSource!=='txtfile'"
                 ref="rdbmsreader"
                 @selectDataSource="showDataSource"/>
    <HiveReader v-show="dataSource==='hive'" ref="hivereader" @selectDataSource="showDataSource"/>
    <HBaseReader v-show="dataSource==='hbase'" ref="hbasereader" @selectDataSource="showDataSource"/>
    <MongoDBReader v-show="dataSource==='mongodb'" ref="mongodbreader" @selectDataSource="showDataSource"/>
    <TxtfileReader v-show="dataSource==='txtfile'" ref="txtfilereader" @selectDataSource="showDataSource"/>
  </div>
</template>

<script>
import RDBMSReader from './reader/RDBMSReader'
import HiveReader from './reader/HiveReader'
import HBaseReader from './reader/HBaseReader'
import MongoDBReader from './reader/MongoDBReader'
import TxtfileReader from "@/views/datax/json-build/reader/TxtfileReader";

export default {
  name: 'Reader',
  components: {RDBMSReader, HiveReader, HBaseReader, MongoDBReader, TxtfileReader},
  data() {
    return {
      dataSource: ''
    }
  },
  methods: {
    getData() {
      if (this.dataSource === 'hive') {
        return this.$refs.hivereader.getData()
      } else if (this.dataSource === 'hbase') {
        return this.$refs.hbasereader.getData()
      } else if (this.dataSource === 'mongodb') {
        return this.$refs.mongodbreader.getData()
      } else if (this.dataSource === 'txtfile') {
        return this.$refs.txtfilereader.getData()
      } else {
        return this.$refs.rdbmsreader.getData()
      }
    },
    showDataSource(data) {
      this.dataSource = data
      this.getData()
    }
  }
}
</script>
