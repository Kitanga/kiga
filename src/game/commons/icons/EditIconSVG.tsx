import { is_mobile } from "../../../App"

export const EditIconSvg = () => {
    return <svg style={{
        width: is_mobile() ? '7px' : '14px',
        height: is_mobile() ? '7px' : '14px',
    }} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_3461_4894)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.6001 0.760112C11.8679 0.0278804 10.6807 0.027878 9.94844 0.760112L1.09996 9.60863C0.838213 9.87038 0.659794 10.2038 0.5872 10.5667L0.220282 12.4013C0.0453516 13.2759 0.8165 14.0471 1.69115 13.8722L3.52574 13.5053C3.88872 13.4327 4.22209 13.2543 4.48384 12.9925L13.3323 4.14399C14.0646 3.41176 14.0646 2.22458 13.3323 1.49234L12.6001 0.760112ZM10.8323 1.64399C11.0764 1.39992 11.4721 1.39992 11.7163 1.64399L12.4484 2.37623C12.6926 2.62031 12.6926 3.01603 12.4484 3.26011L10.7787 4.92986L9.16263 3.31374L10.8323 1.64399ZM8.27869 4.19762L1.98384 10.4925C1.89659 10.5798 1.83713 10.6909 1.81293 10.8119L1.44601 12.6464L3.28059 12.2795C3.40159 12.2553 3.51271 12.1959 3.59996 12.1086L9.89481 5.81374L8.27869 4.19762Z" fill="#FEFEFE" />
        </g>
        <defs>
            <clipPath id="clip0_3461_4894">
                <rect width="14" height="14" fill="white" />
            </clipPath>
        </defs>
    </svg>
}