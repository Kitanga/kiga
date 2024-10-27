import sectionHeaderStyles from './css/SectionHeader.module.css';

export const SectionHeader = (props: any) => {
    return <div class={sectionHeaderStyles.SectionHeader}>{props.children}</div>
}