# force-meta-backup-node

A tool to help download Salesforce.com Metadata.

Using the Salesforce Metadata API, this tool will dynamically generate Ant `build.xml` files and Salesforce Metadata `package.xml` files for downloading the Metadata from your Organisation.

The metadata is downloaded in 3 phases:
- All bulk retrievable components are downloaded first, the `bulkRetrievable` Ant target is dynamically generated and executed.
- Queries are performed on the Salesforce Org. to determine all folders for Dashboards, Documents, Email Templates and Reports. Then `build.xml` and `package.xml` files are dynamically generated with this information. A bulk retrieve is then invoked for all folders and content.
- The remaining miscellaneous metadata components that can not be retrived by bulk or by wildcard methds are downloaded by building a `package.xml` file that explicitly lists these items.

It uses the [Force.com Migration Tool](http://www.salesforce.com/us/developer/docs/daas/index.htm) along with Ant to do most of the heavy lifting. Salesforce [SOAP API](http://www.salesforce.com/us/developer/docs/api/index.htm) and [Metadata API](http://www.salesforce.com/us/developer/docs/api_meta/index.htm) are used in a [node](https://nodejs.org/) script to dynamically build up lists of components for downloading.

Inspired by:

http://wiki.developerforce.com/page/Syncing_Salesforce_Org_Metadata_to_Github
https://github.com/danieljpeter/salesforceMetadataBackup

Converted to node from:

https://github.com/alan-morey/force-meta-backup

## Prerequisites
The following tools should be installed before use:
- [Ant](http://ant.apache.org/)
- [node](https://nodejs.org/)

Ensure you are able to execute both `ant` and `node` on command line:
e.g.
```
$> ant -version
Apache Ant(TM) version 1.8.2 compiled on December 3 2011

$> node -v
v0.12.2
```

## Usage
- Copy `build.sample.properties` to `build.properties`
- Edit `build.properties` and specify your Salesforce credentials
- Copy `connection-info.sample.js` to `connection-info.js`
- Edit `connection-info.js` and specify your Salesforce credentials
- Open command prompt and enter command `ant backupMetadata`

The results will be downloaded to `build/metadata`
