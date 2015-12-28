
var builder = require('xmlbuilder');

var nforce = require('nforce'),
  meta = require('nforce-metadata')(nforce);

var fs = require('fs');

require('connection-info.js');


var bulkMetadataManifestBuilder = function(){
    
    const BUILD_XML = 'bulk-retrievable-target.xml';

    const TYPES = [
        // 'ActionLinkGroupTemplate',
        // 'AnalyticSnapshot',
        // 'ApexComponent',
        'ApexTrigger',
        // 'AppMenu',
        // 'ApprovalProcess',
        // 'ArticleType',
        // 'AssignmentRules',
        // 'AuraDefinitionBundle',
        // 'AuthProvider',
        // 'AutoResponseRules',
        // 'CallCenter',
        // 'Community',
        // 'ConnectedApp',
        // 'CorsWhitelistOrigin',
        // 'CustomApplicationComponent',
        // 'CustomFeedFilter',
        // 'CustomLabels',
        'CustomMetadata',
        // 'CustomPageWebLink',
        // 'CustomSite',
        // 'DataCategoryGroup',
        // 'EntitlementProcess',
        // 'EntitlementTemplate',
        // 'EscalationRules',
        // 'FlexiPage',
        // 'FlowDefinition',
        // 'Group',
        // 'HomePageComponent',
        // 'HomePageLayout',
        'InstalledPackage',
        // 'LiveChatAgentConfig',
        // 'LiveChatButton',
        // 'LiveChatDeployment',
        // 'LiveChatSensitiveDataRule',
        // 'ManagedTopics',
        // 'MatchingRule',
        // 'MilestoneType',
        // 'NamedCredential',
        // 'Network',
        // 'PathAssistant',
        // 'PlatformCachePartition',
        // 'Portal',
        // 'PostTemplate',
        // 'Queue',
        // 'QuickAction',
        // 'RemoteSiteSetting',
        // 'ReportType',
        // 'Role',
        // 'SamlSsoConfig',
        // 'Scontrol',
        // 'Settings',
        // 'SharingRules',
        // 'SharingSet',
        // 'SiteDotCom',
        // 'Skill',
        // 'StaticResource',
        // 'SynonymDictionary',
        // 'Territory',
        // 'Territory2',
        // 'Territory2Model',
        // 'Territory2Rule',
        // 'Territory2Settings',
        // 'Territory2Type',
        // 'TransactionSecurityPolicy',
        // 'Workflow',
        // 'XOrgHub',
        // 'XOrgHubSharedObject'
    ]


    var root = builder.create('project', {}, {}, {headless:true});

    root.att('xmlns:sf','antlib:com.salesforce').att('default','bulkRetrievable');

    root.ele('property').att('file', 'build.properties');
    root.ele('property').att('file', 'ant-includes/default.properties');
    root.ele('property').att('name', 'build.dir').att('value', 'build');

    var setup = root.ele('target').att('name', '-setUp');
        setup.ele('mkdir').att('dir', '${build.dir}');

    var setUpMetadataDir = root.ele('target').att('name', '-setUpMetadataDir').att('depends', '-setUp')
        setUpMetadataDir.ele('property').att('name', 'build.metadata.dir').att('value', '${build.dir}/metadata');
        setUpMetadataDir.ele('mkdir').att('dir', '${build.dir}');

    
    var target = root.ele('target').att('name', 'bulkRetrievable').att('depends', '-setUpMetadataDir');
    for(var i in TYPES){
        var bulkRetrieve = target.ele('sf:bulkRetrieve');
            bulkRetrieve.att('metadataType', TYPES[i]);
            bulkRetrieve.att('retrieveTarget', '${build.metadata.dir}');
            bulkRetrieve.att('username', '${sf.username}');
            bulkRetrieve.att('password', '${sf.password}');
            bulkRetrieve.att('serverurl', '${sf.serverurl}');
            if(TYPES[i] == 'CustomMetadata' || TYPES[i] == 'InstalledPackage'){
                bulkRetrieve.att('batchSize', '${small.batchSize}');
                bulkRetrieve.att('pollWaitMillis', '${small.pollWaitMillis}');
                bulkRetrieve.att('maxPoll', '${small.maxPoll}');
            }
            if(TYPES[i] == 'StaticResource'){
                bulkRetrieve.att('pollWaitMillis', '${sr.pollWaitMillis}');
                bulkRetrieve.att('maxPoll', '${sr.maxPoll}');
            }
    }

    var xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
    
    fs.writeFile("build/"+BUILD_XML, xmlString, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log(BUILD_XML+" was saved!");
    }); 
}

var folders = function(){

}

var miscMetadataManifestBuilder = function(){

}

var profilesMetadataManifestBuilder = function(){

    static final TYPES = [
        'ApexClass',
        'ApexPage',
        'CustomApplication',
        'CustomObject',
        'CustomObjectTranslation',
        // 'CustomPermission',
        'CustomTab',
        // 'ExternalDataSource',
        'Layout'
    ]

    static final PERMISSON_TYPES = [
        'Profile',
        'PermissionSet'
    ]


    var org = nforce.createConnection({
      clientId: connectionInfo.clientId,
      clientSecret: connectionInfo.clientSecret,
      redirectUri: connectionInfo.redirectUri,
      apiVersion: connectionInfo.apiVersion,  
      environment: connectionInfo.environment, 
      mode: connectionInfo.mode,
      username: connectionInfo.username,
      password: connectionInfo.password,
      plugins: ['meta'],
      metaOpts: {
        pollInterval: 1000
      }
    });

    org.authenticate().then(function(){
        return org.meta.listMetadata({
            queries: [
                { type: 'CustomObject' },
                { type: 'CustomField' },
                { type: 'ApexClass' }
            ]
        }); 
    }).then(function(meta) {
        _.each(meta, function(r) {
            console.log(r.type + ': ' + r.fullName + ' (' + r.fileName + ')');
        });
    }).error(function(err) {
        console.error(err);
    });

    ProfilesMetadataManifestBuilder(ForceService forceService, config) {
        this.forceService = forceService
        this.config = config
    }

    private getGroupedFileProperties() {
        if (groupedFileProps == null) {
            
            def queries = TYPES.collect { type ->
                forceService.withValidMetadataType(type) {
                    def query = new ListMetadataQuery()
                    query.type = it
                    query
                }
            }
            queries.removeAll([null])

            def grouped = [:]

            forceService.listMetadata(queries).each { fileProperties ->
                def type = fileProperties.type

                if (!grouped.containsKey(type)) {
                    grouped[type] = []
                }

                grouped[type] << fileProperties
            }

            grouped.each { k, v ->
                v.sort { a, b ->
                    a.namespacePrefix <=> b.namespacePrefix ?: a.fullName <=> b.fullName
                }
            }

            groupedFileProps = grouped
        }

        groupedFileProps
    }

    def writePackageXmlForType(type, fileProperties) {
        def builder = new StreamingMarkupBuilder()
        builder.encoding = 'UTF-8'

        def resolveName = { FileProperties fp ->
            fp.fullName
        }

        def WILDCARD_TYPES = [] + PERMISSON_TYPES;

        if (type == 'Layout') {
            // Note: Page Layout assignments require Layouts & RecordType to be retrieved with Profile 
            WILDCARD_TYPES << 'RecordType'

            // Layouts in managed pacakges must have namespace prefix
            resolveName = { FileProperties fp ->
                if (fp.namespacePrefix) {
                    def namespace = fp.namespacePrefix + '__'
                    def seperator = '-'

                    return fp.fullName.replace(seperator, seperator + namespace)
                }

                fp.fullName
            }
        }

        def xml = builder.bind {
            mkp.xmlDeclaration()
            Package(xmlns: 'http://soap.sforce.com/2006/04/metadata') {
                types {
                    fileProperties.each { fp ->
                        members resolveName(fp)
                    }

                    name type
                }

                WILDCARD_TYPES.each { metadataType ->
                    types {
                        members '*'
                        name metadataType
                    }
                }

                version { mkp.yield forceService.apiVersion }
            }
        }

        def writer = FileWriterFactory.create(profilePackageXmlPath(type))
        XmlUtil.serialize(xml, writer)
    }

    def writePackageXml() {
        groupedFileProperties.each { type, fileProperties ->
            writePackageXmlForType type, fileProperties
        }

        writeBuildXml()
    }

    private profilePackageXmlPath(type) {
        "${config['build.dir']}/profile-packages/${type}.xml"
    }

    private writeBuildXml() {
        def writer = FileWriterFactory.create("${config['build.dir']}/profile-packages-target.xml")
        def builder = new MarkupBuilder(writer)

        def targetName = 'profilesPackageRetrieve'

        builder.project('xmlns:sf': 'antlib:com.salesforce', 'default': targetName) {
            'import'(file: '../ant-includes/setup-target.xml')

            target(name: targetName, depends: '-setUpMetadataDir') {
                groupedFileProperties.each { type, fileProperties ->
                    def retrieveTarget = "${config['build.dir']}/profile-packages-metadata/$type"

                    forceService.withValidMetadataType(type) {
                        mkdir(dir: retrieveTarget)

                        'sf:retrieve'(
                            unpackaged: profilePackageXmlPath(type),
                            retrieveTarget: retrieveTarget,
                            username: '${sf.username}',
                            password: '${sf.password}',
                            serverurl: '${sf.serverurl}',
                            pollWaitMillis: '${sf.pollWaitMillis}',
                            maxPoll: '${sf.maxPoll}'
                        )
                    }
                }
            }
        }
    }

}
/*
class Folders {
    def forceService
    def config
    def packageXmlPath
    def buildXmlPath
    
    static final PACKAGE_XML = 'folders-package.xml'
    static final BUILD_XML = 'folders-build.xml'

    def folderMetaTypeByFolderType = [
        Dashboard: 'Dashboard',
        Document: 'Document',
        Email: 'EmailTemplate',
        Report: 'Report'
    ]

    Folders(ForceService forceService, config) {
        this.forceService = forceService
        this.config = config
        packageXmlPath = "${config['build.dir']}/${PACKAGE_XML}"
        buildXmlPath = "${config['build.dir']}/${BUILD_XML}"
    }

    def writeFoldersPackageXml() {
        def builder = new StreamingMarkupBuilder()

        def foldersAndUnfiled = allFolders

        foldersAndUnfiled['Email'] = (foldersAndUnfiled['Email']) ?: []
        foldersAndUnfiled['Email'] += fetchUnfiledPublicEmailTemplates()

        foldersAndUnfiled['Report'] = (foldersAndUnfiled['Report']) ?: []
        foldersAndUnfiled['Report'] += fetchUnfiledPublicReports()

        builder.encoding = 'UTF-8'
        def xml = builder.bind {
            mkp.xmlDeclaration()
            Package(xmlns: 'http://soap.sforce.com/2006/04/metadata') {
                foldersAndUnfiled.each { folderType, folders ->
                    types {

                        folders.each { folderName ->
                            members folderName 
                        }

                        name folderMetaTypeByFolderType[folderType]
                    }
                }

                version forceService.apiVersion
            }
        }

        def writer = FileWriterFactory.create(packageXmlPath)
        XmlUtil.serialize(xml, writer)
    }

    def writeFolderBulkRetriveXml() {
        def writer = FileWriterFactory.create(buildXmlPath)
        def builder = new MarkupBuilder(writer)

        builder.project('xmlns:sf': 'antlib:com.salesforce', 'default': 'bulkRetrieveFolders') {
            'import'(file: '../ant-includes/setup-target.xml')

            target(name: 'bulkRetrieveFolders', depends: '-setUpMetadataDir') {
                'sf:retrieve'(
                    unpackaged: packageXmlPath,
                    retrieveTarget: '${build.metadata.dir}',
                    username: '${sf.username}',
                    password: '${sf.password}',
                    serverurl: '${sf.serverurl}',
                    pollWaitMillis: '${sf.pollWaitMillis}',
                    maxPoll: '${sf.maxPoll}'
                )

                allFolders.each { folderType, folders ->
                    folders.each { folderName ->
                        'sf:bulkRetrieve'(
                            metadataType: folderMetaTypeByFolderType[folderType],
                            containingFolder: folderName,
                            retrieveTarget: '${build.metadata.dir}',
                            username: '${sf.username}',
                            password: '${sf.password}',
                            serverurl: '${sf.serverurl}',
                            pollWaitMillis: '${sf.pollWaitMillis}',
                            maxPoll: '${sf.maxPoll}'
                        )
                    }
                }
            }
        }
    }

    def getAllFolders() {
        fetchAllFolders()
    }

    private fetchAllFolders() {
        def soql = "SELECT NamespacePrefix, DeveloperName, Type FROM Folder WHERE DeveloperName != '' ORDER BY Type, NamespacePrefix, DeveloperName"
        def sObjects = forceService.query soql

        def folders = [:]

        sObjects.each {
            def prefix = it.getField('NamespacePrefix')
            prefix = (prefix == null) ? '' : prefix + '__'

            def name = it.getField('DeveloperName')
            def type = it.getField('Type')

            if (!folders.containsKey(type)) {
                folders[type] = []
            }

            folders[type] << "$prefix$name"
        }

        folders
    }

    private fetchUnfiledPublicEmailTemplates() {
        def soql = "SELECT DeveloperName FROM EmailTemplate WHERE FolderId = '${forceService.organizationId}'"

        fetchUnfiled soql
    }
        

    private fetchUnfiledPublicReports() {
        def soql = "SELECT DeveloperName FROM Report WHERE OwnerId = '${forceService.organizationId}'"

        fetchUnfiled soql
    }
    private fetchUnfiled(soql) {
        def sObjects = forceService.query soql

        // Unfiled Public folders are not real folders in that there is no
        // folder object in the Folders table, instead the OrganisationId is
        // used as the Folder/Owner and this is what makes it unfiled.
        // There is no direct metadata approach to get this so building this from
        // queries to get list of unfiled components.
        def folder = 'unfiled$public';
        def unfiled = [folder]

        sObjects.each {
            def name = it.getField('DeveloperName')
            unfiled << "$folder/$name"
        }

        unfiled
    }
}

class MiscMetadataManifestBuilder {
    def forceService
    def config
    def packageXmlPath
    
    static final PACKAGE_XML = 'misc-package.xml'

    static final TYPES = [
        'Letterhead'
    ]

    static final WILDCARD_TYPES = [ 
        // XXX Salesforce can't retrieve Flow by bulkRetrieve, the active
        // version number need to be applied to the fullName. I think only way
        // to find that is in FlowDefinition and that would require parsing
        // Using * wildcard simplifiies the retrieval for Flows.
        'Flow'
    ]

    MiscMetadataManifestBuilder(ForceService forceService, config) {
        this.forceService = forceService
        this.config = config
        packageXmlPath = "${config['build.dir']}/${PACKAGE_XML}"
    }


    private getGroupedFileProperties() {
        def queries = TYPES.collect { type ->
            forceService.withValidMetadataType(type) {
                def query = new ListMetadataQuery()
                query.type = it
                query
            }
        }
        queries.removeAll([null])

        def grouped = [:]

        forceService.listMetadata(queries).each { fileProperties ->
            def type = fileProperties.type

            if (!grouped.containsKey(type)) {
                grouped[type] = []
            }

            grouped[type] << fileProperties
        }

        grouped
    }

    def writePackageXml() {
        def builder = new StreamingMarkupBuilder()
        builder.encoding = 'UTF-8'

        def xml = builder.bind {
            mkp.xmlDeclaration()
            Package(xmlns: 'http://soap.sforce.com/2006/04/metadata') {

                groupedFileProperties.each { type, fileProperties ->
                    types {
                        fileProperties.each { fp ->
                            members fp.fullName
                        }

                        name type
                    }
                }

                WILDCARD_TYPES.each { type ->
                    types {
                        members '*'
                        name type
                    }
                }

                version forceService.apiVersion
            }
        }

        def writer = FileWriterFactory.create(packageXmlPath)
        XmlUtil.serialize(xml, writer)
    }
}

class ProfilesMetadataManifestBuilder {
    def forceService
    def config
    def groupedFileProps

    static final TYPES = [
        'ApexClass',
        'ApexPage',
        'CustomApplication',
        'CustomObject',
        'CustomObjectTranslation',
        'CustomPermission',
        'CustomTab',
        'ExternalDataSource',
        'Layout'
    ]

    static final PERMISSON_TYPES = [
        'Profile',
        'PermissionSet'
    ]

    ProfilesMetadataManifestBuilder(ForceService forceService, config) {
        this.forceService = forceService
        this.config = config
    }

    private getGroupedFileProperties() {
        if (groupedFileProps == null) {
            
            def queries = TYPES.collect { type ->
                forceService.withValidMetadataType(type) {
                    def query = new ListMetadataQuery()
                    query.type = it
                    query
                }
            }
            queries.removeAll([null])

            def grouped = [:]

            forceService.listMetadata(queries).each { fileProperties ->
                def type = fileProperties.type

                if (!grouped.containsKey(type)) {
                    grouped[type] = []
                }

                grouped[type] << fileProperties
            }

            grouped.each { k, v ->
                v.sort { a, b ->
                    a.namespacePrefix <=> b.namespacePrefix ?: a.fullName <=> b.fullName
                }
            }

            groupedFileProps = grouped
        }

        groupedFileProps
    }

    def writePackageXmlForType(type, fileProperties) {
        def builder = new StreamingMarkupBuilder()
        builder.encoding = 'UTF-8'

        def resolveName = { FileProperties fp ->
            fp.fullName
        }

        def WILDCARD_TYPES = [] + PERMISSON_TYPES;

        if (type == 'Layout') {
            // Note: Page Layout assignments require Layouts & RecordType to be retrieved with Profile 
            WILDCARD_TYPES << 'RecordType'

            // Layouts in managed pacakges must have namespace prefix
            resolveName = { FileProperties fp ->
                if (fp.namespacePrefix) {
                    def namespace = fp.namespacePrefix + '__'
                    def seperator = '-'

                    return fp.fullName.replace(seperator, seperator + namespace)
                }

                fp.fullName
            }
        }

        def xml = builder.bind {
            mkp.xmlDeclaration()
            Package(xmlns: 'http://soap.sforce.com/2006/04/metadata') {
                types {
                    fileProperties.each { fp ->
                        members resolveName(fp)
                    }

                    name type
                }

                WILDCARD_TYPES.each { metadataType ->
                    types {
                        members '*'
                        name metadataType
                    }
                }

                version { mkp.yield forceService.apiVersion }
            }
        }

        def writer = FileWriterFactory.create(profilePackageXmlPath(type))
        XmlUtil.serialize(xml, writer)
    }

    def writePackageXml() {
        groupedFileProperties.each { type, fileProperties ->
            writePackageXmlForType type, fileProperties
        }

        writeBuildXml()
    }

    private profilePackageXmlPath(type) {
        "${config['build.dir']}/profile-packages/${type}.xml"
    }

    private writeBuildXml() {
        def writer = FileWriterFactory.create("${config['build.dir']}/profile-packages-target.xml")
        def builder = new MarkupBuilder(writer)

        def targetName = 'profilesPackageRetrieve'

        builder.project('xmlns:sf': 'antlib:com.salesforce', 'default': targetName) {
            'import'(file: '../ant-includes/setup-target.xml')

            target(name: targetName, depends: '-setUpMetadataDir') {
                groupedFileProperties.each { type, fileProperties ->
                    def retrieveTarget = "${config['build.dir']}/profile-packages-metadata/$type"

                    forceService.withValidMetadataType(type) {
                        mkdir(dir: retrieveTarget)

                        'sf:retrieve'(
                            unpackaged: profilePackageXmlPath(type),
                            retrieveTarget: retrieveTarget,
                            username: '${sf.username}',
                            password: '${sf.password}',
                            serverurl: '${sf.serverurl}',
                            pollWaitMillis: '${sf.pollWaitMillis}',
                            maxPoll: '${sf.maxPoll}'
                        )
                    }
                }
            }
        }
    }
}
*/


////////////////////////////////////////////////////////////////////////////////


bulkMetadataManifestBuilder();   

    // Default Action
/*
    def bulk = new BulkMetadataManifestBuilder(forceService, config)
    bulk.writeBuildXml()
    
    def folders = new Folders(forceService, config)
    folders.writeFolderBulkRetriveXml()
    folders.writeFoldersPackageXml()

    def misc = new MiscMetadataManifestBuilder(forceService, config)
    misc.writePackageXml()

    def profiles = new ProfilesMetadataManifestBuilder(forceService, config)
    profiles.writePackageXml()
*/