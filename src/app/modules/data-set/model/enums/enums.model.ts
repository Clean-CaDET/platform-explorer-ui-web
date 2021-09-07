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
