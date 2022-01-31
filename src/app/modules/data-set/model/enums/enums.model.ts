export enum InstanceType {
    Method = 'Method',
    Class = 'Class',
    All = 'All'
}

export enum InstanceFilter {
    All = 'All',
    NeedAdditionalAnnotations = 'Need Additional Annotations',
    DisagreeingAnnotations = 'Disagreeing Annotations'
}

export enum ProjectState {
    Processing = 'Processing',
    Built = 'Built',
    Failed = 'Failed'
}

export enum AnnotationStatus {
    Annotated = 'Annotated',
    Not_Annotated = 'Not_Annotated',
    All = 'All'
}

export enum ConsistencyType {
    ConsistencyForAnnotator = 'Consistency for my annotations',
    ConsistencyBetweenAnnotators = 'Consistency between annotators',
    MetricsSignificanceForAnnotator = 'Metrics significance for my annotations',
    MetricsSignificanceBetweenAnnotators = 'Metrics significance between annotators'
}

export enum NumOfInstancesType {
    Percentage = 'Percentage',
    Number = 'Number'
}

export enum RelationType {
    Referenced = 'Referenced',
    References = 'References',
    Parent = 'Parent'
}

export enum CouplingType {
    Field = 'Field',
    MethodInvocation = 'MethodInvocation',
    Parameter = 'Parameter',
    ReturnType = 'ReturnType',
    Variable = 'Variable',
    Parent = 'Parent',
    AccessedAccessor = 'AccessedAccessor',
    AccessedField = 'AccessedField'
}
