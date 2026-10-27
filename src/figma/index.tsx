import {useId,type ComponentType,type CSSProperties} from "react";
import {staticFile} from "remotion";
import "../fonts";
import metadata from "./illustrations.json";
import assemblyData from "./assemblies.json";
import {FigmaImage,FigmaPreload,FigmaEffects,type FigmaEffect} from "./runtime";
import resourceData from "./resources.json";
import contractData from "./component-contracts.json";
import {validateComponentProps, type ComponentContracts, type ComponentProps} from "../composition/schema.mjs";
import {createEditableBindings} from "./editable-tree.mjs";
import {createInternalMotionBindings,validateInternalMotion,type InternalMotionTrack} from "../composition/internal-motion.mjs";
import {EditableArtworkProvider} from "./EditableArtwork";
import {embeddedRegistry} from "../embedded/catalog";
import {resolveEmbeddedInstances,validateEmbeddedData,type EmbeddedInput} from "../embedded/runtime.mjs";
const contracts=contractData as unknown as ComponentContracts;
const resources:Record<string,string[]>=resourceData;
import Figma41938_116836 from "./generated/original-handbook-subscription-lifecycle";
import Figma41938_117014 from "./generated/original-ai-agent-trials-reply";
import Figma41938_124428 from "./generated/original-plugins-page-38536-44361";
import Figma41938_124508 from "./generated/original-plugins-page-38536-44443";
import Figma41938_124550 from "./generated/original-plugins-page-38536-44675";
import Figma41938_124611 from "./generated/original-plugins-page-38536-44738";
import Figma41938_124718 from "./generated/original-plugins-page-38536-44851";
import Figma41938_124824 from "./generated/original-plugins-page-38536-45143";
import Figma41938_124885 from "./generated/original-plugins-page-38536-45206";
import Figma41938_124992 from "./generated/original-plugins-page-38536-45319";
import Figma41938_125098 from "./generated/original-plugins-page-38536-45611";
import Figma41938_125159 from "./generated/original-plugins-page-38536-45674";
import Figma41938_125372 from "./generated/original-plugins-page-38536-46079";
import Figma41938_125814 from "./generated/original-plugins-page-38536-46723";
import Figma41938_126000 from "./generated/original-plugins-page-38430-44082";
import Figma41938_126164 from "./generated/original-funnels-certified-partners-40322-34551";
import Figma41938_126291 from "./generated/original-funnels-certified-partners-40322-34829";
import Figma41938_126415 from "./generated/original-funnels-certified-partners-40322-34959";
import Figma41938_136050 from "./generated/original-web-to-app-40322-46202";
import Figma41938_136089 from "./generated/original-web-to-app-40322-46459";
import Figma41938_137726 from "./generated/original-marketing-template-41926-46726";
import Figma41938_138039 from "./generated/original-marketing-template-41926-47172";
import Figma41938_138173 from "./generated/original-marketing-template-41926-47307";
import Figma41938_138227 from "./generated/original-marketing-template-41926-47371";
import Figma41938_139025 from "./generated/original-funnels-certified-partners-41930-66644";
import Figma41938_139152 from "./generated/original-funnels-certified-partners-41930-66922";
import Figma41938_139276 from "./generated/original-funnels-certified-partners-41930-67052";
import Figma41938_139410 from "./generated/original-paywalls-41930-75213";
import Figma41938_139718 from "./generated/original-paywalls-41930-75557";
import Figma41938_139977 from "./generated/original-paywalls-41930-75866";
import Figma41938_140074 from "./generated/original-partner-page-new-41930-88210";
import Figma41938_140200 from "./generated/original-partner-page-new-41930-88353";
import Figma41938_140376 from "./generated/original-partner-page-new-41930-88614";
import Figma41938_140441 from "./generated/original-partner-page-new-41930-88689";
import Figma41938_140513 from "./generated/original-partner-page-new-41930-88841";
import Figma41938_140615 from "./generated/original-partner-page-new-41930-88994";
import Figma41938_140658 from "./generated/original-partner-page-new-41930-89062";
import Figma41938_140729 from "./generated/original-paywalls-new-components-41930-99017";
import Figma41938_140788 from "./generated/original-paywalls-new-components-41930-99308";
import Figma41938_24938 from "./generated/revenuecat-main-03";
import Figma41938_25294 from "./generated/revenuecat-main-06";
import Figma41938_48622 from "./generated/revenuecat-paddle-page-04";
import Figma41938_48800 from "./generated/revenuecat-paddle-page-07";
import Figma41938_48909 from "./generated/revenuecat-stripe-page-01";
import Figma41938_48965 from "./generated/revenuecat-stripe-page-02";
import Figma41938_49026 from "./generated/revenuecat-stripe-page-03";
import Figma41938_49090 from "./generated/revenuecat-stripe-page-04";
import Figma41938_49217 from "./generated/revenuecat-stripe-page-06";
import Figma41938_49291 from "./generated/revenuecat-stripe-page-07";
import Figma41938_49346 from "./generated/web-button-section-01";
import Figma41938_49506 from "./generated/web-button-section-02";
import Figma41938_50064 from "./generated/web-button-section-03";
import Figma41938_50258 from "./generated/web-button-section-04";
import Figma41938_50353 from "./generated/web-button-section-05";
import Figma41938_50420 from "./generated/web-button-section-06";
import Figma41938_50520 from "./generated/web-button-section-07";
import Figma41938_50602 from "./generated/web-button-section-08";
import Figma41938_50684 from "./generated/refund-control-page-01";
import Figma41938_50815 from "./generated/refund-control-page-02";
import Figma41938_50949 from "./generated/refund-control-page-03";
import Figma41938_51046 from "./generated/revenuecat-whyrevenuecat-01";
import Figma41938_51292 from "./generated/revenuecat-whyrevenuecat-02";
import Figma41938_51358 from "./generated/revenuecat-whyrevenuecat-03";
import Figma41938_51522 from "./generated/revenuecat-whyrevenuecat-04";
import Figma41938_51577 from "./generated/revenuecat-whyrevenuecat-05";
import Figma41938_51659 from "./generated/revenuecat-whyrevenuecat-06";
import Figma41938_85497 from "./generated/original-amplitude-trial-rate-paywall";
import Figma41938_86007 from "./generated/original-amplitude-subscription-analytics";
import Figma41938_86303 from "./generated/original-firebase-fitness-paywall";
import Figma41941_44410 from "./generated/ai-paywall-start";
import Figma41941_44414 from "./generated/ai-prompt-card";
import Figma41941_44438 from "./generated/ai-paywall-prompt";
import Figma41941_44536 from "./generated/ai-paywall-upload";
import Figma41941_44629 from "./generated/ai-paywall-generating";
import Figma41941_44927 from "./generated/ai-paywall-complete";
import Figma41944_45413 from "./generated/cancellation-feedback-table";
import Figma41944_45460 from "./generated/cancellation-feedback-survey";
import Figma41944_45528 from "./generated/feedback-glow";
import Figma41944_45531 from "./generated/feedback-table";
import Figma41944_45573 from "./generated/feedback-subscription-phone";
import Figma41944_45574 from "./generated/feedback-title-wash";
import Figma41944_45577 from "./generated/cancellation-card-base";
import Figma41944_45578 from "./generated/cancellation-card-fill";
import Figma41944_48741 from "./generated/cancellation-card-glow";
import Figma41944_48742 from "./generated/cancellation-card-border";
import Figma41944_48743 from "./generated/cancellation-card-title";
import Figma41944_48744 from "./generated/cancellation-card-icon";
import Figma41944_52051 from "./generated/support-glow";
import Figma41944_52054 from "./generated/support-orbit";
import Figma41944_52057 from "./generated/refund-badge";
import Figma41944_52065 from "./generated/cancel-badge";
import Figma41944_52070 from "./generated/purchases-badge";
import Figma41944_52078 from "./generated/support-subscription-phone";
import Figma41944_52079 from "./generated/support-title-wash";
import Figma41944_52082 from "./generated/support-card-base";
import Figma41944_52083 from "./generated/support-card-fill";
import Figma41944_55246 from "./generated/support-card-glow";
import Figma41944_55247 from "./generated/support-card-border";
import Figma41944_55248 from "./generated/support-card-title";
import Figma41944_55249 from "./generated/support-card-icon";
import Figma41944_55258 from "./generated/subscription-support-home";
import Figma41944_55287 from "./generated/subscription-support-refund";
import Figma41944_55348 from "./generated/appearance-editor-green";
import Figma41944_55378 from "./generated/appearance-editor-blue";
import Figma41944_55408 from "./generated/appearance-editor-buttons";
import Figma41944_55439 from "./generated/appearance-glow";
import Figma41944_55442 from "./generated/appearance-close-icon";
import Figma41944_55445 from "./generated/appearance-settings-panel";
import Figma41944_55465 from "./generated/appearance-subscription-phone";
import Figma41944_55466 from "./generated/appearance-title-wash";
import Figma41944_55469 from "./generated/appearance-card-base";
import Figma41944_55470 from "./generated/appearance-card-fill";
import Figma41944_58633 from "./generated/appearance-card-glow";
import Figma41944_58634 from "./generated/appearance-card-border";
import Figma41944_58635 from "./generated/appearance-card-title";
import Figma41944_58636 from "./generated/appearance-card-icon";
import Figma41944_58646 from "./generated/customer-center-subscription";
import Figma41944_58722 from "./generated/customer-center-cancel-reason";
import Figma41944_58785 from "./generated/customer-center-retention-offer";
import Figma41944_58833 from "./generated/customer-center-app-settings";
import Figma_kAngSWapljVFOOUAen6APm_3252_1001 from "./generated/selected-3252-1001";
import Figma_kAngSWapljVFOOUAen6APm_3252_10069 from "./generated/selected-3252-10069";
import Figma_kAngSWapljVFOOUAen6APm_3252_10215 from "./generated/selected-3252-10215";
import Figma_kAngSWapljVFOOUAen6APm_3252_10336 from "./generated/selected-3252-10336";
import Figma_kAngSWapljVFOOUAen6APm_3252_10381 from "./generated/selected-3252-10381";
import Figma_kAngSWapljVFOOUAen6APm_3252_10607 from "./generated/selected-3252-10607";
import Figma_kAngSWapljVFOOUAen6APm_3252_10692 from "./generated/selected-3252-10692";
import Figma_kAngSWapljVFOOUAen6APm_3252_10695 from "./generated/selected-3252-10695";
import Figma_kAngSWapljVFOOUAen6APm_3252_10698 from "./generated/selected-3252-10698";
import Figma_kAngSWapljVFOOUAen6APm_3252_10705 from "./generated/selected-3252-10705";
import Figma_kAngSWapljVFOOUAen6APm_3252_10716 from "./generated/selected-3252-10716";
import Figma_kAngSWapljVFOOUAen6APm_3252_10724 from "./generated/selected-3252-10724";
import Figma_kAngSWapljVFOOUAen6APm_3252_10762 from "./generated/selected-3252-10762";
import Figma_kAngSWapljVFOOUAen6APm_3252_10765 from "./generated/selected-3252-10765";
import Figma_kAngSWapljVFOOUAen6APm_3252_10766 from "./generated/selected-3252-10766";
import Figma_kAngSWapljVFOOUAen6APm_3252_1176 from "./generated/selected-3252-1176";
import Figma_kAngSWapljVFOOUAen6APm_3252_1232 from "./generated/selected-3252-1232";
import Figma_kAngSWapljVFOOUAen6APm_3252_1278 from "./generated/selected-3252-1278";
import Figma_kAngSWapljVFOOUAen6APm_3252_1388 from "./generated/selected-3252-1388";
import Figma_kAngSWapljVFOOUAen6APm_3252_13929 from "./generated/selected-3252-13929";
import Figma_kAngSWapljVFOOUAen6APm_3252_13930 from "./generated/selected-3252-13930";
import Figma_kAngSWapljVFOOUAen6APm_3252_13931 from "./generated/selected-3252-13931";
import Figma_kAngSWapljVFOOUAen6APm_3252_13932 from "./generated/selected-3252-13932";
import Figma_kAngSWapljVFOOUAen6APm_3252_13947 from "./generated/selected-3252-13947";
import Figma_kAngSWapljVFOOUAen6APm_3252_13950 from "./generated/selected-3252-13950";
import Figma_kAngSWapljVFOOUAen6APm_3252_13953 from "./generated/selected-3252-13953";
import Figma_kAngSWapljVFOOUAen6APm_3252_13954 from "./generated/selected-3252-13954";
import Figma_kAngSWapljVFOOUAen6APm_3252_13955 from "./generated/selected-3252-13955";
import Figma_kAngSWapljVFOOUAen6APm_3252_13961 from "./generated/selected-3252-13961";
import Figma_kAngSWapljVFOOUAen6APm_3252_13999 from "./generated/selected-3252-13999";
import Figma_kAngSWapljVFOOUAen6APm_3252_14002 from "./generated/selected-3252-14002";
import Figma_kAngSWapljVFOOUAen6APm_3252_14003 from "./generated/selected-3252-14003";
import Figma_kAngSWapljVFOOUAen6APm_3252_1462 from "./generated/selected-3252-1462";
import Figma_kAngSWapljVFOOUAen6APm_3252_1527 from "./generated/selected-3252-1527";
import Figma_kAngSWapljVFOOUAen6APm_3252_1578 from "./generated/selected-3252-1578";
import Figma_kAngSWapljVFOOUAen6APm_3252_161 from "./generated/selected-3252-161";
import Figma_kAngSWapljVFOOUAen6APm_3252_17166 from "./generated/selected-3252-17166";
import Figma_kAngSWapljVFOOUAen6APm_3252_17167 from "./generated/selected-3252-17167";
import Figma_kAngSWapljVFOOUAen6APm_3252_17168 from "./generated/selected-3252-17168";
import Figma_kAngSWapljVFOOUAen6APm_3252_17183 from "./generated/selected-3252-17183";
import Figma_kAngSWapljVFOOUAen6APm_3252_17186 from "./generated/selected-3252-17186";
import Figma_kAngSWapljVFOOUAen6APm_3252_17189 from "./generated/selected-3252-17189";
import Figma_kAngSWapljVFOOUAen6APm_3252_17197 from "./generated/selected-3252-17197";
import Figma_kAngSWapljVFOOUAen6APm_3252_17202 from "./generated/selected-3252-17202";
import Figma_kAngSWapljVFOOUAen6APm_3252_17210 from "./generated/selected-3252-17210";
import Figma_kAngSWapljVFOOUAen6APm_3252_17248 from "./generated/selected-3252-17248";
import Figma_kAngSWapljVFOOUAen6APm_3252_17251 from "./generated/selected-3252-17251";
import Figma_kAngSWapljVFOOUAen6APm_3252_17252 from "./generated/selected-3252-17252";
import Figma_kAngSWapljVFOOUAen6APm_3252_1782 from "./generated/selected-3252-1782";
import Figma_kAngSWapljVFOOUAen6APm_3252_1832 from "./generated/selected-3252-1832";
import Figma_kAngSWapljVFOOUAen6APm_3252_2036 from "./generated/selected-3252-2036";
import Figma_kAngSWapljVFOOUAen6APm_3252_20415 from "./generated/selected-3252-20415";
import Figma_kAngSWapljVFOOUAen6APm_3252_20416 from "./generated/selected-3252-20416";
import Figma_kAngSWapljVFOOUAen6APm_3252_20417 from "./generated/selected-3252-20417";
import Figma_kAngSWapljVFOOUAen6APm_3252_20418 from "./generated/selected-3252-20418";
import Figma_kAngSWapljVFOOUAen6APm_3252_20435 from "./generated/selected-3252-20435";
import Figma_kAngSWapljVFOOUAen6APm_3252_20438 from "./generated/selected-3252-20438";
import Figma_kAngSWapljVFOOUAen6APm_3252_20441 from "./generated/selected-3252-20441";
import Figma_kAngSWapljVFOOUAen6APm_3252_20460 from "./generated/selected-3252-20460";
import Figma_kAngSWapljVFOOUAen6APm_3252_20498 from "./generated/selected-3252-20498";
import Figma_kAngSWapljVFOOUAen6APm_3252_20501 from "./generated/selected-3252-20501";
import Figma_kAngSWapljVFOOUAen6APm_3252_20502 from "./generated/selected-3252-20502";
import Figma_kAngSWapljVFOOUAen6APm_3252_2168 from "./generated/selected-3252-2168";
import Figma_kAngSWapljVFOOUAen6APm_3252_2223 from "./generated/selected-3252-2223";
import Figma_kAngSWapljVFOOUAen6APm_3252_2356 from "./generated/selected-3252-2356";
import Figma_kAngSWapljVFOOUAen6APm_3252_23665 from "./generated/selected-3252-23665";
import Figma_kAngSWapljVFOOUAen6APm_3252_23666 from "./generated/selected-3252-23666";
import Figma_kAngSWapljVFOOUAen6APm_3252_23667 from "./generated/selected-3252-23667";
import Figma_kAngSWapljVFOOUAen6APm_3252_23668 from "./generated/selected-3252-23668";
import Figma_kAngSWapljVFOOUAen6APm_3252_23683 from "./generated/selected-3252-23683";
import Figma_kAngSWapljVFOOUAen6APm_3252_23723 from "./generated/selected-3252-23723";
import Figma_kAngSWapljVFOOUAen6APm_3252_23766 from "./generated/selected-3252-23766";
import Figma_kAngSWapljVFOOUAen6APm_3252_23889 from "./generated/selected-3252-23889";
import Figma_kAngSWapljVFOOUAen6APm_3252_24012 from "./generated/selected-3252-24012";
import Figma_kAngSWapljVFOOUAen6APm_3252_24135 from "./generated/selected-3252-24135";
import Figma_kAngSWapljVFOOUAen6APm_3252_24261 from "./generated/selected-3252-24261";
import Figma_kAngSWapljVFOOUAen6APm_3252_24423 from "./generated/selected-3252-24423";
import Figma_kAngSWapljVFOOUAen6APm_3252_2473 from "./generated/selected-3252-2473";
import Figma_kAngSWapljVFOOUAen6APm_3252_24984 from "./generated/selected-3252-24984";
import Figma_kAngSWapljVFOOUAen6APm_3252_25179 from "./generated/selected-3252-25179";
import Figma_kAngSWapljVFOOUAen6APm_3252_25278 from "./generated/selected-3252-25278";
import Figma_kAngSWapljVFOOUAen6APm_3252_25348 from "./generated/selected-3252-25348";
import Figma_kAngSWapljVFOOUAen6APm_3252_25451 from "./generated/selected-3252-25451";
import Figma_kAngSWapljVFOOUAen6APm_3252_25539 from "./generated/selected-3252-25539";
import Figma_kAngSWapljVFOOUAen6APm_3252_25746 from "./generated/selected-3252-25746";
import Figma_kAngSWapljVFOOUAen6APm_3252_25806 from "./generated/selected-3252-25806";
import Figma_kAngSWapljVFOOUAen6APm_3252_25881 from "./generated/selected-3252-25881";
import Figma_kAngSWapljVFOOUAen6APm_3252_25998 from "./generated/selected-3252-25998";
import Figma_kAngSWapljVFOOUAen6APm_3252_26044 from "./generated/selected-3252-26044";
import Figma_kAngSWapljVFOOUAen6APm_3252_26105 from "./generated/selected-3252-26105";
import Figma_kAngSWapljVFOOUAen6APm_3252_26368 from "./generated/selected-3252-26368";
import Figma_kAngSWapljVFOOUAen6APm_3252_26670 from "./generated/selected-3252-26670";
import Figma_kAngSWapljVFOOUAen6APm_3252_26704 from "./generated/selected-3252-26704";
import Figma_kAngSWapljVFOOUAen6APm_3252_26774 from "./generated/selected-3252-26774";
import Figma_kAngSWapljVFOOUAen6APm_3252_26941 from "./generated/selected-3252-26941";
import Figma_kAngSWapljVFOOUAen6APm_3252_27038 from "./generated/selected-3252-27038";
import Figma_kAngSWapljVFOOUAen6APm_3252_2717 from "./generated/selected-3252-2717";
import Figma_kAngSWapljVFOOUAen6APm_3252_27232 from "./generated/selected-3252-27232";
import Figma_kAngSWapljVFOOUAen6APm_3252_27391 from "./generated/selected-3252-27391";
import Figma_kAngSWapljVFOOUAen6APm_3252_27548 from "./generated/selected-3252-27548";
import Figma_kAngSWapljVFOOUAen6APm_3252_27665 from "./generated/selected-3252-27665";
import Figma_kAngSWapljVFOOUAen6APm_3252_27723 from "./generated/selected-3252-27723";
import Figma_kAngSWapljVFOOUAen6APm_3252_27891 from "./generated/selected-3252-27891";
import Figma_kAngSWapljVFOOUAen6APm_3252_27897 from "./generated/selected-3252-27897";
import Figma_kAngSWapljVFOOUAen6APm_3252_284 from "./generated/selected-3252-284";
import Figma_kAngSWapljVFOOUAen6APm_3252_2896 from "./generated/selected-3252-2896";
import Figma_kAngSWapljVFOOUAen6APm_3252_31060 from "./generated/selected-3252-31060";
import Figma_kAngSWapljVFOOUAen6APm_3252_31062 from "./generated/selected-3252-31062";
import Figma_kAngSWapljVFOOUAen6APm_3252_31063 from "./generated/selected-3252-31063";
import Figma_kAngSWapljVFOOUAen6APm_3252_31065 from "./generated/selected-3252-31065";
import Figma_kAngSWapljVFOOUAen6APm_3252_31078 from "./generated/selected-3252-31078";
import Figma_kAngSWapljVFOOUAen6APm_3252_34241 from "./generated/selected-3252-34241";
import Figma_kAngSWapljVFOOUAen6APm_3252_34243 from "./generated/selected-3252-34243";
import Figma_kAngSWapljVFOOUAen6APm_3252_34244 from "./generated/selected-3252-34244";
import Figma_kAngSWapljVFOOUAen6APm_3252_34246 from "./generated/selected-3252-34246";
import Figma_kAngSWapljVFOOUAen6APm_3252_34257 from "./generated/selected-3252-34257";
import Figma_kAngSWapljVFOOUAen6APm_3252_345 from "./generated/selected-3252-345";
import Figma_kAngSWapljVFOOUAen6APm_3252_3523 from "./generated/selected-3252-3523";
import Figma_kAngSWapljVFOOUAen6APm_3252_3525 from "./generated/selected-3252-3525";
import Figma_kAngSWapljVFOOUAen6APm_3252_37420 from "./generated/selected-3252-37420";
import Figma_kAngSWapljVFOOUAen6APm_3252_37421 from "./generated/selected-3252-37421";
import Figma_kAngSWapljVFOOUAen6APm_3252_37423 from "./generated/selected-3252-37423";
import Figma_kAngSWapljVFOOUAen6APm_3252_37425 from "./generated/selected-3252-37425";
import Figma_kAngSWapljVFOOUAen6APm_3252_37440 from "./generated/selected-3252-37440";
import Figma_kAngSWapljVFOOUAen6APm_3252_3757 from "./generated/selected-3252-3757";
import Figma_kAngSWapljVFOOUAen6APm_3252_3758 from "./generated/selected-3252-3758";
import Figma_kAngSWapljVFOOUAen6APm_3252_3760 from "./generated/selected-3252-3760";
import Figma_kAngSWapljVFOOUAen6APm_3252_3761 from "./generated/selected-3252-3761";
import Figma_kAngSWapljVFOOUAen6APm_3252_3762 from "./generated/selected-3252-3762";
import Figma_kAngSWapljVFOOUAen6APm_3252_3763 from "./generated/selected-3252-3763";
import Figma_kAngSWapljVFOOUAen6APm_3252_3764 from "./generated/selected-3252-3764";
import Figma_kAngSWapljVFOOUAen6APm_3252_3769 from "./generated/selected-3252-3769";
import Figma_kAngSWapljVFOOUAen6APm_3252_4001 from "./generated/selected-3252-4001";
import Figma_kAngSWapljVFOOUAen6APm_3252_4002 from "./generated/selected-3252-4002";
import Figma_kAngSWapljVFOOUAen6APm_3252_4004 from "./generated/selected-3252-4004";
import Figma_kAngSWapljVFOOUAen6APm_3252_4005 from "./generated/selected-3252-4005";
import Figma_kAngSWapljVFOOUAen6APm_3252_4006 from "./generated/selected-3252-4006";
import Figma_kAngSWapljVFOOUAen6APm_3252_4007 from "./generated/selected-3252-4007";
import Figma_kAngSWapljVFOOUAen6APm_3252_4008 from "./generated/selected-3252-4008";
import Figma_kAngSWapljVFOOUAen6APm_3252_4009 from "./generated/selected-3252-4009";
import Figma_kAngSWapljVFOOUAen6APm_3252_40603 from "./generated/selected-3252-40603";
import Figma_kAngSWapljVFOOUAen6APm_3252_40605 from "./generated/selected-3252-40605";
import Figma_kAngSWapljVFOOUAen6APm_3252_40606 from "./generated/selected-3252-40606";
import Figma_kAngSWapljVFOOUAen6APm_3252_40616 from "./generated/selected-3252-40616";
import Figma_kAngSWapljVFOOUAen6APm_3252_40618 from "./generated/selected-3252-40618";
import Figma_kAngSWapljVFOOUAen6APm_3252_40648 from "./generated/selected-3252-40648";
import Figma_kAngSWapljVFOOUAen6APm_3252_40658 from "./generated/selected-3252-40658";
import Figma_kAngSWapljVFOOUAen6APm_3252_40663 from "./generated/selected-3252-40663";
import Figma_kAngSWapljVFOOUAen6APm_3252_40692 from "./generated/selected-3252-40692";
import Figma_kAngSWapljVFOOUAen6APm_3252_40713 from "./generated/selected-3252-40713";
import Figma_kAngSWapljVFOOUAen6APm_3252_40822 from "./generated/selected-3252-40822";
import Figma_kAngSWapljVFOOUAen6APm_3252_40901 from "./generated/selected-3252-40901";
import Figma_kAngSWapljVFOOUAen6APm_3252_40988 from "./generated/selected-3252-40988";
import Figma_kAngSWapljVFOOUAen6APm_3252_41041 from "./generated/selected-3252-41041";
import Figma_kAngSWapljVFOOUAen6APm_3252_41046 from "./generated/selected-3252-41046";
import Figma_kAngSWapljVFOOUAen6APm_3252_41104 from "./generated/selected-3252-41104";
import Figma_kAngSWapljVFOOUAen6APm_3252_41140 from "./generated/selected-3252-41140";
import Figma_kAngSWapljVFOOUAen6APm_3252_41218 from "./generated/selected-3252-41218";
import Figma_kAngSWapljVFOOUAen6APm_3252_41318 from "./generated/selected-3252-41318";
import Figma_kAngSWapljVFOOUAen6APm_3252_41323 from "./generated/selected-3252-41323";
import Figma_kAngSWapljVFOOUAen6APm_3252_41371 from "./generated/selected-3252-41371";
import Figma_kAngSWapljVFOOUAen6APm_3252_41402 from "./generated/selected-3252-41402";
import Figma_kAngSWapljVFOOUAen6APm_3252_41408 from "./generated/selected-3252-41408";
import Figma_kAngSWapljVFOOUAen6APm_3252_41443 from "./generated/selected-3252-41443";
import Figma_kAngSWapljVFOOUAen6APm_3252_41490 from "./generated/selected-3252-41490";
import Figma_kAngSWapljVFOOUAen6APm_3252_415 from "./generated/selected-3252-415";
import Figma_kAngSWapljVFOOUAen6APm_3252_41525 from "./generated/selected-3252-41525";
import Figma_kAngSWapljVFOOUAen6APm_3252_41627 from "./generated/selected-3252-41627";
import Figma_kAngSWapljVFOOUAen6APm_3252_41647 from "./generated/selected-3252-41647";
import Figma_kAngSWapljVFOOUAen6APm_3252_41718 from "./generated/selected-3252-41718";
import Figma_kAngSWapljVFOOUAen6APm_3252_41725 from "./generated/selected-3252-41725";
import Figma_kAngSWapljVFOOUAen6APm_3252_41795 from "./generated/selected-3252-41795";
import Figma_kAngSWapljVFOOUAen6APm_3252_41834 from "./generated/selected-3252-41834";
import Figma_kAngSWapljVFOOUAen6APm_3252_41868 from "./generated/selected-3252-41868";
import Figma_kAngSWapljVFOOUAen6APm_3252_4241 from "./generated/selected-3252-4241";
import Figma_kAngSWapljVFOOUAen6APm_3252_4242 from "./generated/selected-3252-4242";
import Figma_kAngSWapljVFOOUAen6APm_3252_4244 from "./generated/selected-3252-4244";
import Figma_kAngSWapljVFOOUAen6APm_3252_4245 from "./generated/selected-3252-4245";
import Figma_kAngSWapljVFOOUAen6APm_3252_4246 from "./generated/selected-3252-4246";
import Figma_kAngSWapljVFOOUAen6APm_3252_4247 from "./generated/selected-3252-4247";
import Figma_kAngSWapljVFOOUAen6APm_3252_4248 from "./generated/selected-3252-4248";
import Figma_kAngSWapljVFOOUAen6APm_3252_4249 from "./generated/selected-3252-4249";
import Figma_kAngSWapljVFOOUAen6APm_3252_43633 from "./generated/selected-3252-43633";
import Figma_kAngSWapljVFOOUAen6APm_3252_43636 from "./generated/selected-3252-43636";
import Figma_kAngSWapljVFOOUAen6APm_3252_43637 from "./generated/selected-3252-43637";
import Figma_kAngSWapljVFOOUAen6APm_3252_43638 from "./generated/selected-3252-43638";
import Figma_kAngSWapljVFOOUAen6APm_3252_43639 from "./generated/selected-3252-43639";
import Figma_kAngSWapljVFOOUAen6APm_3252_43659 from "./generated/selected-3252-43659";
import Figma_kAngSWapljVFOOUAen6APm_3252_43673 from "./generated/selected-3252-43673";
import Figma_kAngSWapljVFOOUAen6APm_3252_43675 from "./generated/selected-3252-43675";
import Figma_kAngSWapljVFOOUAen6APm_3252_4488 from "./generated/selected-3252-4488";
import Figma_kAngSWapljVFOOUAen6APm_3252_4489 from "./generated/selected-3252-4489";
import Figma_kAngSWapljVFOOUAen6APm_3252_4492 from "./generated/selected-3252-4492";
import Figma_kAngSWapljVFOOUAen6APm_3252_4493 from "./generated/selected-3252-4493";
import Figma_kAngSWapljVFOOUAen6APm_3252_4499 from "./generated/selected-3252-4499";
import Figma_kAngSWapljVFOOUAen6APm_3252_4516 from "./generated/selected-3252-4516";
import Figma_kAngSWapljVFOOUAen6APm_3252_4517 from "./generated/selected-3252-4517";
import Figma_kAngSWapljVFOOUAen6APm_3252_4518 from "./generated/selected-3252-4518";
import Figma_kAngSWapljVFOOUAen6APm_3252_4519 from "./generated/selected-3252-4519";
import Figma_kAngSWapljVFOOUAen6APm_3252_4522 from "./generated/selected-3252-4522";
import Figma_kAngSWapljVFOOUAen6APm_3252_4523 from "./generated/selected-3252-4523";
import Figma_kAngSWapljVFOOUAen6APm_3252_4524 from "./generated/selected-3252-4524";
import Figma_kAngSWapljVFOOUAen6APm_3252_4525 from "./generated/selected-3252-4525";
import Figma_kAngSWapljVFOOUAen6APm_3252_4529 from "./generated/selected-3252-4529";
import Figma_kAngSWapljVFOOUAen6APm_3252_4582 from "./generated/selected-3252-4582";
import Figma_kAngSWapljVFOOUAen6APm_3252_4641 from "./generated/selected-3252-4641";
import Figma_kAngSWapljVFOOUAen6APm_3252_46852 from "./generated/selected-3252-46852";
import Figma_kAngSWapljVFOOUAen6APm_3252_46853 from "./generated/selected-3252-46853";
import Figma_kAngSWapljVFOOUAen6APm_3252_46854 from "./generated/selected-3252-46854";
import Figma_kAngSWapljVFOOUAen6APm_3252_46865 from "./generated/selected-3252-46865";
import Figma_kAngSWapljVFOOUAen6APm_3252_46868 from "./generated/selected-3252-46868";
import Figma_kAngSWapljVFOOUAen6APm_3252_46877 from "./generated/selected-3252-46877";
import Figma_kAngSWapljVFOOUAen6APm_3252_46880 from "./generated/selected-3252-46880";
import Figma_kAngSWapljVFOOUAen6APm_3252_4705 from "./generated/selected-3252-4705";
import Figma_kAngSWapljVFOOUAen6APm_3252_4772 from "./generated/selected-3252-4772";
import Figma_kAngSWapljVFOOUAen6APm_3252_482 from "./generated/selected-3252-482";
import Figma_kAngSWapljVFOOUAen6APm_3252_4842 from "./generated/selected-3252-4842";
import Figma_kAngSWapljVFOOUAen6APm_3252_4909 from "./generated/selected-3252-4909";
import Figma_kAngSWapljVFOOUAen6APm_3252_50046 from "./generated/selected-3252-50046";
import Figma_kAngSWapljVFOOUAen6APm_3252_50047 from "./generated/selected-3252-50047";
import Figma_kAngSWapljVFOOUAen6APm_3252_50048 from "./generated/selected-3252-50048";
import Figma_kAngSWapljVFOOUAen6APm_3252_50055 from "./generated/selected-3252-50055";
import Figma_kAngSWapljVFOOUAen6APm_3252_5024 from "./generated/selected-3252-5024";
import Figma_kAngSWapljVFOOUAen6APm_3252_5081 from "./generated/selected-3252-5081";
import Figma_kAngSWapljVFOOUAen6APm_3252_5142 from "./generated/selected-3252-5142";
import Figma_kAngSWapljVFOOUAen6APm_3252_5201 from "./generated/selected-3252-5201";
import Figma_kAngSWapljVFOOUAen6APm_3252_5265 from "./generated/selected-3252-5265";
import Figma_kAngSWapljVFOOUAen6APm_3252_53236 from "./generated/selected-3252-53236";
import Figma_kAngSWapljVFOOUAen6APm_3252_53239 from "./generated/selected-3252-53239";
import Figma_kAngSWapljVFOOUAen6APm_3252_53242 from "./generated/selected-3252-53242";
import Figma_kAngSWapljVFOOUAen6APm_3252_5332 from "./generated/selected-3252-5332";
import Figma_kAngSWapljVFOOUAen6APm_3252_5402 from "./generated/selected-3252-5402";
import Figma_kAngSWapljVFOOUAen6APm_3252_5466 from "./generated/selected-3252-5466";
import Figma_kAngSWapljVFOOUAen6APm_3252_5543 from "./generated/selected-3252-5543";
import Figma_kAngSWapljVFOOUAen6APm_3252_5604 from "./generated/selected-3252-5604";
import Figma_kAngSWapljVFOOUAen6APm_3252_563 from "./generated/selected-3252-563";
import Figma_kAngSWapljVFOOUAen6APm_3252_56425 from "./generated/selected-3252-56425";
import Figma_kAngSWapljVFOOUAen6APm_3252_5766 from "./generated/selected-3252-5766";
import Figma_kAngSWapljVFOOUAen6APm_3252_59604 from "./generated/selected-3252-59604";
import Figma_kAngSWapljVFOOUAen6APm_3252_59606 from "./generated/selected-3252-59606";
import Figma_kAngSWapljVFOOUAen6APm_3252_62783 from "./generated/selected-3252-62783";
import Figma_kAngSWapljVFOOUAen6APm_3252_62784 from "./generated/selected-3252-62784";
import Figma_kAngSWapljVFOOUAen6APm_3252_62785 from "./generated/selected-3252-62785";
import Figma_kAngSWapljVFOOUAen6APm_3252_62794 from "./generated/selected-3252-62794";
import Figma_kAngSWapljVFOOUAen6APm_3252_62797 from "./generated/selected-3252-62797";
import Figma_kAngSWapljVFOOUAen6APm_3252_62800 from "./generated/selected-3252-62800";
import Figma_kAngSWapljVFOOUAen6APm_3252_62812 from "./generated/selected-3252-62812";
import Figma_kAngSWapljVFOOUAen6APm_3252_6327 from "./generated/selected-3252-6327";
import Figma_kAngSWapljVFOOUAen6APm_3252_635 from "./generated/selected-3252-635";
import Figma_kAngSWapljVFOOUAen6APm_3252_6524 from "./generated/selected-3252-6524";
import Figma_kAngSWapljVFOOUAen6APm_3252_65996 from "./generated/selected-3252-65996";
import Figma_kAngSWapljVFOOUAen6APm_3252_6623 from "./generated/selected-3252-6623";
import Figma_kAngSWapljVFOOUAen6APm_3252_6693 from "./generated/selected-3252-6693";
import Figma_kAngSWapljVFOOUAen6APm_3252_6796 from "./generated/selected-3252-6796";
import Figma_kAngSWapljVFOOUAen6APm_3252_685 from "./generated/selected-3252-685";
import Figma_kAngSWapljVFOOUAen6APm_3252_6881 from "./generated/selected-3252-6881";
import Figma_kAngSWapljVFOOUAen6APm_3252_69175 from "./generated/selected-3252-69175";
import Figma_kAngSWapljVFOOUAen6APm_3252_69177 from "./generated/selected-3252-69177";
import Figma_kAngSWapljVFOOUAen6APm_3252_6969 from "./generated/selected-3252-6969";
import Figma_kAngSWapljVFOOUAen6APm_3252_7103 from "./generated/selected-3252-7103";
import Figma_kAngSWapljVFOOUAen6APm_3252_72343 from "./generated/selected-3252-72343";
import Figma_kAngSWapljVFOOUAen6APm_3252_72344 from "./generated/selected-3252-72344";
import Figma_kAngSWapljVFOOUAen6APm_3252_72349 from "./generated/selected-3252-72349";
import Figma_kAngSWapljVFOOUAen6APm_3252_7239 from "./generated/selected-3252-7239";
import Figma_kAngSWapljVFOOUAen6APm_3252_72402 from "./generated/selected-3252-72402";
import Figma_kAngSWapljVFOOUAen6APm_3252_72490 from "./generated/selected-3252-72490";
import Figma_kAngSWapljVFOOUAen6APm_3252_72531 from "./generated/selected-3252-72531";
import Figma_kAngSWapljVFOOUAen6APm_3252_72592 from "./generated/selected-3252-72592";
import Figma_kAngSWapljVFOOUAen6APm_3252_72662 from "./generated/selected-3252-72662";
import Figma_kAngSWapljVFOOUAen6APm_3252_72715 from "./generated/selected-3252-72715";
import Figma_kAngSWapljVFOOUAen6APm_3252_72759 from "./generated/selected-3252-72759";
import Figma_kAngSWapljVFOOUAen6APm_3252_72805 from "./generated/selected-3252-72805";
import Figma_kAngSWapljVFOOUAen6APm_3252_72829 from "./generated/selected-3252-72829";
import Figma_kAngSWapljVFOOUAen6APm_3252_72861 from "./generated/selected-3252-72861";
import Figma_kAngSWapljVFOOUAen6APm_3252_72881 from "./generated/selected-3252-72881";
import Figma_kAngSWapljVFOOUAen6APm_3252_73010 from "./generated/selected-3252-73010";
import Figma_kAngSWapljVFOOUAen6APm_3252_73033 from "./generated/selected-3252-73033";
import Figma_kAngSWapljVFOOUAen6APm_3252_73101 from "./generated/selected-3252-73101";
import Figma_kAngSWapljVFOOUAen6APm_3252_73123 from "./generated/selected-3252-73123";
import Figma_kAngSWapljVFOOUAen6APm_3252_73224 from "./generated/selected-3252-73224";
import Figma_kAngSWapljVFOOUAen6APm_3252_73303 from "./generated/selected-3252-73303";
import Figma_kAngSWapljVFOOUAen6APm_3252_73323 from "./generated/selected-3252-73323";
import Figma_kAngSWapljVFOOUAen6APm_3252_73390 from "./generated/selected-3252-73390";
import Figma_kAngSWapljVFOOUAen6APm_3252_73395 from "./generated/selected-3252-73395";
import Figma_kAngSWapljVFOOUAen6APm_3252_7342 from "./generated/selected-3252-7342";
import Figma_kAngSWapljVFOOUAen6APm_3252_73464 from "./generated/selected-3252-73464";
import Figma_kAngSWapljVFOOUAen6APm_3252_73474 from "./generated/selected-3252-73474";
import Figma_kAngSWapljVFOOUAen6APm_3252_73503 from "./generated/selected-3252-73503";
import Figma_kAngSWapljVFOOUAen6APm_3252_73508 from "./generated/selected-3252-73508";
import Figma_kAngSWapljVFOOUAen6APm_3252_73542 from "./generated/selected-3252-73542";
import Figma_kAngSWapljVFOOUAen6APm_3252_73572 from "./generated/selected-3252-73572";
import Figma_kAngSWapljVFOOUAen6APm_3252_73653 from "./generated/selected-3252-73653";
import Figma_kAngSWapljVFOOUAen6APm_3252_73704 from "./generated/selected-3252-73704";
import Figma_kAngSWapljVFOOUAen6APm_3252_73707 from "./generated/selected-3252-73707";
import Figma_kAngSWapljVFOOUAen6APm_3252_73735 from "./generated/selected-3252-73735";
import Figma_kAngSWapljVFOOUAen6APm_3252_73750 from "./generated/selected-3252-73750";
import Figma_kAngSWapljVFOOUAen6APm_3252_73799 from "./generated/selected-3252-73799";
import Figma_kAngSWapljVFOOUAen6APm_3252_73894 from "./generated/selected-3252-73894";
import Figma_kAngSWapljVFOOUAen6APm_3252_73984 from "./generated/selected-3252-73984";
import Figma_kAngSWapljVFOOUAen6APm_3252_74089 from "./generated/selected-3252-74089";
import Figma_kAngSWapljVFOOUAen6APm_3252_74197 from "./generated/selected-3252-74197";
import Figma_kAngSWapljVFOOUAen6APm_3252_74302 from "./generated/selected-3252-74302";
import Figma_kAngSWapljVFOOUAen6APm_3252_74398 from "./generated/selected-3252-74398";
import Figma_kAngSWapljVFOOUAen6APm_3252_74467 from "./generated/selected-3252-74467";
import Figma_kAngSWapljVFOOUAen6APm_3252_74596 from "./generated/selected-3252-74596";
import Figma_kAngSWapljVFOOUAen6APm_3252_746 from "./generated/selected-3252-746";
import Figma_kAngSWapljVFOOUAen6APm_3252_74616 from "./generated/selected-3252-74616";
import Figma_kAngSWapljVFOOUAen6APm_3252_74622 from "./generated/selected-3252-74622";
import Figma_kAngSWapljVFOOUAen6APm_3252_74629 from "./generated/selected-3252-74629";
import Figma_kAngSWapljVFOOUAen6APm_3252_74640 from "./generated/selected-3252-74640";
import Figma_kAngSWapljVFOOUAen6APm_3252_74647 from "./generated/selected-3252-74647";
import Figma_kAngSWapljVFOOUAen6APm_3252_74663 from "./generated/selected-3252-74663";
import Figma_kAngSWapljVFOOUAen6APm_3252_74671 from "./generated/selected-3252-74671";
import Figma_kAngSWapljVFOOUAen6APm_3252_74684 from "./generated/selected-3252-74684";
import Figma_kAngSWapljVFOOUAen6APm_3252_74701 from "./generated/selected-3252-74701";
import Figma_kAngSWapljVFOOUAen6APm_3252_74743 from "./generated/selected-3252-74743";
import Figma_kAngSWapljVFOOUAen6APm_3252_74753 from "./generated/selected-3252-74753";
import Figma_kAngSWapljVFOOUAen6APm_3252_74875 from "./generated/selected-3252-74875";
import Figma_kAngSWapljVFOOUAen6APm_3252_74933 from "./generated/selected-3252-74933";
import Figma_kAngSWapljVFOOUAen6APm_3252_74935 from "./generated/selected-3252-74935";
import Figma_kAngSWapljVFOOUAen6APm_3252_75014 from "./generated/selected-3252-75014";
import Figma_kAngSWapljVFOOUAen6APm_3252_75052 from "./generated/selected-3252-75052";
import Figma_kAngSWapljVFOOUAen6APm_3252_75058 from "./generated/selected-3252-75058";
import Figma_kAngSWapljVFOOUAen6APm_3252_75134 from "./generated/selected-3252-75134";
import Figma_kAngSWapljVFOOUAen6APm_3252_75166 from "./generated/selected-3252-75166";
import Figma_kAngSWapljVFOOUAen6APm_3252_75172 from "./generated/selected-3252-75172";
import Figma_kAngSWapljVFOOUAen6APm_3252_75269 from "./generated/selected-3252-75269";
import Figma_kAngSWapljVFOOUAen6APm_3252_75325 from "./generated/selected-3252-75325";
import Figma_kAngSWapljVFOOUAen6APm_3252_75363 from "./generated/selected-3252-75363";
import Figma_kAngSWapljVFOOUAen6APm_3252_75383 from "./generated/selected-3252-75383";
import Figma_kAngSWapljVFOOUAen6APm_3252_75499 from "./generated/selected-3252-75499";
import Figma_kAngSWapljVFOOUAen6APm_3252_75522 from "./generated/selected-3252-75522";
import Figma_kAngSWapljVFOOUAen6APm_3252_75640 from "./generated/selected-3252-75640";
import Figma_kAngSWapljVFOOUAen6APm_3252_75665 from "./generated/selected-3252-75665";
import Figma_kAngSWapljVFOOUAen6APm_3252_75787 from "./generated/selected-3252-75787";
import Figma_kAngSWapljVFOOUAen6APm_3252_75808 from "./generated/selected-3252-75808";
import Figma_kAngSWapljVFOOUAen6APm_3252_7591 from "./generated/selected-3252-7591";
import Figma_kAngSWapljVFOOUAen6APm_3252_75922 from "./generated/selected-3252-75922";
import Figma_kAngSWapljVFOOUAen6APm_3252_75945 from "./generated/selected-3252-75945";
import Figma_kAngSWapljVFOOUAen6APm_3252_76085 from "./generated/selected-3252-76085";
import Figma_kAngSWapljVFOOUAen6APm_3252_76134 from "./generated/selected-3252-76134";
import Figma_kAngSWapljVFOOUAen6APm_3252_76143 from "./generated/selected-3252-76143";
import Figma_kAngSWapljVFOOUAen6APm_3252_76482 from "./generated/selected-3252-76482";
import Figma_kAngSWapljVFOOUAen6APm_3252_76488 from "./generated/selected-3252-76488";
import Figma_kAngSWapljVFOOUAen6APm_3252_76497 from "./generated/selected-3252-76497";
import Figma_kAngSWapljVFOOUAen6APm_3252_76529 from "./generated/selected-3252-76529";
import Figma_kAngSWapljVFOOUAen6APm_3252_76545 from "./generated/selected-3252-76545";
import Figma_kAngSWapljVFOOUAen6APm_3252_76548 from "./generated/selected-3252-76548";
import Figma_kAngSWapljVFOOUAen6APm_3252_76549 from "./generated/selected-3252-76549";
import Figma_kAngSWapljVFOOUAen6APm_3252_76551 from "./generated/selected-3252-76551";
import Figma_kAngSWapljVFOOUAen6APm_3252_76553 from "./generated/selected-3252-76553";
import Figma_kAngSWapljVFOOUAen6APm_3252_7660 from "./generated/selected-3252-7660";
import Figma_kAngSWapljVFOOUAen6APm_3252_76654 from "./generated/selected-3252-76654";
import Figma_kAngSWapljVFOOUAen6APm_3252_7827 from "./generated/selected-3252-7827";
import Figma_kAngSWapljVFOOUAen6APm_3252_7886 from "./generated/selected-3252-7886";
import Figma_kAngSWapljVFOOUAen6APm_3252_7971 from "./generated/selected-3252-7971";
import Figma_kAngSWapljVFOOUAen6APm_3252_79817 from "./generated/selected-3252-79817";
import Figma_kAngSWapljVFOOUAen6APm_3252_79818 from "./generated/selected-3252-79818";
import Figma_kAngSWapljVFOOUAen6APm_3252_79835 from "./generated/selected-3252-79835";
import Figma_kAngSWapljVFOOUAen6APm_3252_80001 from "./generated/selected-3252-80001";
import Figma_kAngSWapljVFOOUAen6APm_3252_80120 from "./generated/selected-3252-80120";
import Figma_kAngSWapljVFOOUAen6APm_3252_80203 from "./generated/selected-3252-80203";
import Figma_kAngSWapljVFOOUAen6APm_3252_80286 from "./generated/selected-3252-80286";
import Figma_kAngSWapljVFOOUAen6APm_3252_80331 from "./generated/selected-3252-80331";
import Figma_kAngSWapljVFOOUAen6APm_3252_80334 from "./generated/selected-3252-80334";
import Figma_kAngSWapljVFOOUAen6APm_3252_80395 from "./generated/selected-3252-80395";
import Figma_kAngSWapljVFOOUAen6APm_3252_80506 from "./generated/selected-3252-80506";
import Figma_kAngSWapljVFOOUAen6APm_3252_80507 from "./generated/selected-3252-80507";
import Figma_kAngSWapljVFOOUAen6APm_3252_80566 from "./generated/selected-3252-80566";
import Figma_kAngSWapljVFOOUAen6APm_3252_80615 from "./generated/selected-3252-80615";
import Figma_kAngSWapljVFOOUAen6APm_3252_80679 from "./generated/selected-3252-80679";
import Figma_kAngSWapljVFOOUAen6APm_3252_8068 from "./generated/selected-3252-8068";
import Figma_kAngSWapljVFOOUAen6APm_3252_80789 from "./generated/selected-3252-80789";
import Figma_kAngSWapljVFOOUAen6APm_3252_80899 from "./generated/selected-3252-80899";
import Figma_kAngSWapljVFOOUAen6APm_3252_81073 from "./generated/selected-3252-81073";
import Figma_kAngSWapljVFOOUAen6APm_3252_81182 from "./generated/selected-3252-81182";
import Figma_kAngSWapljVFOOUAen6APm_3252_81357 from "./generated/selected-3252-81357";
import Figma_kAngSWapljVFOOUAen6APm_3252_82010 from "./generated/selected-3252-82010";
import Figma_kAngSWapljVFOOUAen6APm_3252_82140 from "./generated/selected-3252-82140";
import Figma_kAngSWapljVFOOUAen6APm_3252_82267 from "./generated/selected-3252-82267";
import Figma_kAngSWapljVFOOUAen6APm_3252_82374 from "./generated/selected-3252-82374";
import Figma_kAngSWapljVFOOUAen6APm_3252_82377 from "./generated/selected-3252-82377";
import Figma_kAngSWapljVFOOUAen6APm_3252_8317 from "./generated/selected-3252-8317";
import Figma_kAngSWapljVFOOUAen6APm_3252_8524 from "./generated/selected-3252-8524";
import Figma_kAngSWapljVFOOUAen6APm_3252_85558 from "./generated/selected-3252-85558";
import Figma_kAngSWapljVFOOUAen6APm_3252_8589 from "./generated/selected-3252-8589";
import Figma_kAngSWapljVFOOUAen6APm_3252_88737 from "./generated/selected-3252-88737";
import Figma_kAngSWapljVFOOUAen6APm_3252_88739 from "./generated/selected-3252-88739";
import Figma_kAngSWapljVFOOUAen6APm_3252_9132 from "./generated/selected-3252-9132";
import Figma_kAngSWapljVFOOUAen6APm_3252_91905 from "./generated/selected-3252-91905";
import Figma_kAngSWapljVFOOUAen6APm_3252_91906 from "./generated/selected-3252-91906";
import Figma_kAngSWapljVFOOUAen6APm_3252_91907 from "./generated/selected-3252-91907";
import Figma_kAngSWapljVFOOUAen6APm_3252_91911 from "./generated/selected-3252-91911";
import Figma_kAngSWapljVFOOUAen6APm_3252_91953 from "./generated/selected-3252-91953";
import Figma_kAngSWapljVFOOUAen6APm_3252_92104 from "./generated/selected-3252-92104";
import Figma_kAngSWapljVFOOUAen6APm_3252_92105 from "./generated/selected-3252-92105";
import Figma_kAngSWapljVFOOUAen6APm_3252_92169 from "./generated/selected-3252-92169";
import Figma_kAngSWapljVFOOUAen6APm_3252_92420 from "./generated/selected-3252-92420";
import Figma_kAngSWapljVFOOUAen6APm_3252_92556 from "./generated/selected-3252-92556";
import Figma_kAngSWapljVFOOUAen6APm_3252_92560 from "./generated/selected-3252-92560";
import Figma_kAngSWapljVFOOUAen6APm_3252_92589 from "./generated/selected-3252-92589";
import Figma_kAngSWapljVFOOUAen6APm_3252_92613 from "./generated/selected-3252-92613";
import Figma_kAngSWapljVFOOUAen6APm_3252_92706 from "./generated/selected-3252-92706";
import Figma_kAngSWapljVFOOUAen6APm_3252_92716 from "./generated/selected-3252-92716";
import Figma_kAngSWapljVFOOUAen6APm_3252_92836 from "./generated/selected-3252-92836";
import Figma_kAngSWapljVFOOUAen6APm_3252_92963 from "./generated/selected-3252-92963";
import Figma_kAngSWapljVFOOUAen6APm_3252_92974 from "./generated/selected-3252-92974";
import Figma_kAngSWapljVFOOUAen6APm_3252_93066 from "./generated/selected-3252-93066";
import Figma_kAngSWapljVFOOUAen6APm_3252_93131 from "./generated/selected-3252-93131";
import Figma_kAngSWapljVFOOUAen6APm_3252_93216 from "./generated/selected-3252-93216";
import Figma_kAngSWapljVFOOUAen6APm_3252_93394 from "./generated/selected-3252-93394";
import Figma_kAngSWapljVFOOUAen6APm_3252_93395 from "./generated/selected-3252-93395";
import Figma_kAngSWapljVFOOUAen6APm_3252_93497 from "./generated/selected-3252-93497";
import Figma_kAngSWapljVFOOUAen6APm_3252_93626 from "./generated/selected-3252-93626";
import Figma_kAngSWapljVFOOUAen6APm_3252_9367 from "./generated/selected-3252-9367";
import Figma_kAngSWapljVFOOUAen6APm_3252_93735 from "./generated/selected-3252-93735";
import Figma_kAngSWapljVFOOUAen6APm_3252_93808 from "./generated/selected-3252-93808";
import Figma_kAngSWapljVFOOUAen6APm_3252_93832 from "./generated/selected-3252-93832";
import Figma_kAngSWapljVFOOUAen6APm_3252_93864 from "./generated/selected-3252-93864";
import Figma_kAngSWapljVFOOUAen6APm_3252_93877 from "./generated/selected-3252-93877";
import Figma_kAngSWapljVFOOUAen6APm_3252_93951 from "./generated/selected-3252-93951";
import Figma_kAngSWapljVFOOUAen6APm_3252_93953 from "./generated/selected-3252-93953";
import Figma_kAngSWapljVFOOUAen6APm_3252_94056 from "./generated/selected-3252-94056";
import Figma_kAngSWapljVFOOUAen6APm_3252_94059 from "./generated/selected-3252-94059";
import Figma_kAngSWapljVFOOUAen6APm_3252_94102 from "./generated/selected-3252-94102";
import Figma_kAngSWapljVFOOUAen6APm_3252_94179 from "./generated/selected-3252-94179";
import Figma_kAngSWapljVFOOUAen6APm_3252_94224 from "./generated/selected-3252-94224";
import Figma_kAngSWapljVFOOUAen6APm_3252_94233 from "./generated/selected-3252-94233";
import Figma_kAngSWapljVFOOUAen6APm_3252_94241 from "./generated/selected-3252-94241";
import Figma_kAngSWapljVFOOUAen6APm_3252_94245 from "./generated/selected-3252-94245";
import Figma_kAngSWapljVFOOUAen6APm_3252_94268 from "./generated/selected-3252-94268";
import Figma_kAngSWapljVFOOUAen6APm_3252_94313 from "./generated/selected-3252-94313";
import Figma_kAngSWapljVFOOUAen6APm_3252_9481 from "./generated/selected-3252-9481";
import Figma_kAngSWapljVFOOUAen6APm_3252_9605 from "./generated/selected-3252-9605";
import Figma_kAngSWapljVFOOUAen6APm_3252_9676 from "./generated/selected-3252-9676";
import Figma_kAngSWapljVFOOUAen6APm_3252_9720 from "./generated/selected-3252-9720";
import Figma_kAngSWapljVFOOUAen6APm_3252_9844 from "./generated/selected-3252-9844";
import Figma_kAngSWapljVFOOUAen6APm_3252_9931 from "./generated/selected-3252-9931";
import Figma_kAngSWapljVFOOUAen6APm_3252_9990 from "./generated/selected-3252-9990";
import NativePart_3252_73135 from "./generated/selected-3252-73135";
import NativePart_3252_73192 from "./generated/selected-3252-73192";
import NativePart_3252_72984 from "./generated/selected-3252-72984";
import NativePart_3252_73023 from "./generated/selected-3252-73023";
import NativePart_3252_73260 from "./generated/selected-3252-73260";

export const figmaIllustrations = metadata;
const components: Record<string, ComponentType> = {
"original-handbook-subscription-lifecycle": Figma41938_116836,
"original-ai-agent-trials-reply": Figma41938_117014,
"original-plugins-page-38536-44361": Figma41938_124428,
"original-plugins-page-38536-44443": Figma41938_124508,
"original-plugins-page-38536-44675": Figma41938_124550,
"original-plugins-page-38536-44738": Figma41938_124611,
"original-plugins-page-38536-44851": Figma41938_124718,
"original-plugins-page-38536-45143": Figma41938_124824,
"original-plugins-page-38536-45206": Figma41938_124885,
"original-plugins-page-38536-45319": Figma41938_124992,
"original-plugins-page-38536-45611": Figma41938_125098,
"original-plugins-page-38536-45674": Figma41938_125159,
"original-plugins-page-38536-46079": Figma41938_125372,
"original-plugins-page-38536-46723": Figma41938_125814,
"original-plugins-page-38430-44082": Figma41938_126000,
"original-funnels-certified-partners-40322-34551": Figma41938_126164,
"original-funnels-certified-partners-40322-34829": Figma41938_126291,
"original-funnels-certified-partners-40322-34959": Figma41938_126415,
"original-web-to-app-40322-46202": Figma41938_136050,
"original-web-to-app-40322-46459": Figma41938_136089,
"original-marketing-template-41926-46726": Figma41938_137726,
"original-marketing-template-41926-47172": Figma41938_138039,
"original-marketing-template-41926-47307": Figma41938_138173,
"original-marketing-template-41926-47371": Figma41938_138227,
"original-funnels-certified-partners-41930-66644": Figma41938_139025,
"original-funnels-certified-partners-41930-66922": Figma41938_139152,
"original-funnels-certified-partners-41930-67052": Figma41938_139276,
"original-paywalls-41930-75213": Figma41938_139410,
"original-paywalls-41930-75557": Figma41938_139718,
"original-paywalls-41930-75866": Figma41938_139977,
"original-partner-page-new-41930-88210": Figma41938_140074,
"original-partner-page-new-41930-88353": Figma41938_140200,
"original-partner-page-new-41930-88614": Figma41938_140376,
"original-partner-page-new-41930-88689": Figma41938_140441,
"original-partner-page-new-41930-88841": Figma41938_140513,
"original-partner-page-new-41930-88994": Figma41938_140615,
"original-partner-page-new-41930-89062": Figma41938_140658,
"original-paywalls-new-components-41930-99017": Figma41938_140729,
"original-paywalls-new-components-41930-99308": Figma41938_140788,
"revenuecat-main-03": Figma41938_24938,
"revenuecat-main-06": Figma41938_25294,
"revenuecat-paddle-page-04": Figma41938_48622,
"revenuecat-paddle-page-07": Figma41938_48800,
"revenuecat-stripe-page-01": Figma41938_48909,
"revenuecat-stripe-page-02": Figma41938_48965,
"revenuecat-stripe-page-03": Figma41938_49026,
"revenuecat-stripe-page-04": Figma41938_49090,
"revenuecat-stripe-page-06": Figma41938_49217,
"revenuecat-stripe-page-07": Figma41938_49291,
"web-button-section-01": Figma41938_49346,
"web-button-section-02": Figma41938_49506,
"web-button-section-03": Figma41938_50064,
"web-button-section-04": Figma41938_50258,
"web-button-section-05": Figma41938_50353,
"web-button-section-06": Figma41938_50420,
"web-button-section-07": Figma41938_50520,
"web-button-section-08": Figma41938_50602,
"refund-control-page-01": Figma41938_50684,
"refund-control-page-02": Figma41938_50815,
"refund-control-page-03": Figma41938_50949,
"revenuecat-whyrevenuecat-01": Figma41938_51046,
"revenuecat-whyrevenuecat-02": Figma41938_51292,
"revenuecat-whyrevenuecat-03": Figma41938_51358,
"revenuecat-whyrevenuecat-04": Figma41938_51522,
"revenuecat-whyrevenuecat-05": Figma41938_51577,
"revenuecat-whyrevenuecat-06": Figma41938_51659,
"original-amplitude-trial-rate-paywall": Figma41938_85497,
"original-amplitude-subscription-analytics": Figma41938_86007,
"original-firebase-fitness-paywall": Figma41938_86303,
"ai-paywall-start": Figma41941_44410,
"ai-prompt-card": Figma41941_44414,
"ai-paywall-prompt": Figma41941_44438,
"ai-paywall-upload": Figma41941_44536,
"ai-paywall-generating": Figma41941_44629,
"ai-paywall-complete": Figma41941_44927,
"cancellation-feedback-table": Figma41944_45413,
"cancellation-feedback-survey": Figma41944_45460,
"feedback-glow": Figma41944_45528,
"feedback-table": Figma41944_45531,
"feedback-subscription-phone": Figma41944_45573,
"feedback-title-wash": Figma41944_45574,
"cancellation-card-base": Figma41944_45577,
"cancellation-card-fill": Figma41944_45578,
"cancellation-card-glow": Figma41944_48741,
"cancellation-card-border": Figma41944_48742,
"cancellation-card-title": Figma41944_48743,
"cancellation-card-icon": Figma41944_48744,
"support-glow": Figma41944_52051,
"support-orbit": Figma41944_52054,
"refund-badge": Figma41944_52057,
"cancel-badge": Figma41944_52065,
"purchases-badge": Figma41944_52070,
"support-subscription-phone": Figma41944_52078,
"support-title-wash": Figma41944_52079,
"support-card-base": Figma41944_52082,
"support-card-fill": Figma41944_52083,
"support-card-glow": Figma41944_55246,
"support-card-border": Figma41944_55247,
"support-card-title": Figma41944_55248,
"support-card-icon": Figma41944_55249,
"subscription-support-home": Figma41944_55258,
"subscription-support-refund": Figma41944_55287,
"appearance-editor-green": Figma41944_55348,
"appearance-editor-blue": Figma41944_55378,
"appearance-editor-buttons": Figma41944_55408,
"appearance-glow": Figma41944_55439,
"appearance-close-icon": Figma41944_55442,
"appearance-settings-panel": Figma41944_55445,
"appearance-subscription-phone": Figma41944_55465,
"appearance-title-wash": Figma41944_55466,
"appearance-card-base": Figma41944_55469,
"appearance-card-fill": Figma41944_55470,
"appearance-card-glow": Figma41944_58633,
"appearance-card-border": Figma41944_58634,
"appearance-card-title": Figma41944_58635,
"appearance-card-icon": Figma41944_58636,
"customer-center-subscription": Figma41944_58646,
"customer-center-cancel-reason": Figma41944_58722,
"customer-center-retention-offer": Figma41944_58785,
"customer-center-app-settings": Figma41944_58833,
"selected-3252-1001": Figma_kAngSWapljVFOOUAen6APm_3252_1001,
"selected-3252-10069": Figma_kAngSWapljVFOOUAen6APm_3252_10069,
"selected-3252-10215": Figma_kAngSWapljVFOOUAen6APm_3252_10215,
"selected-3252-10336": Figma_kAngSWapljVFOOUAen6APm_3252_10336,
"selected-3252-10381": Figma_kAngSWapljVFOOUAen6APm_3252_10381,
"selected-3252-10607": Figma_kAngSWapljVFOOUAen6APm_3252_10607,
"selected-3252-10692": Figma_kAngSWapljVFOOUAen6APm_3252_10692,
"selected-3252-10695": Figma_kAngSWapljVFOOUAen6APm_3252_10695,
"selected-3252-10698": Figma_kAngSWapljVFOOUAen6APm_3252_10698,
"selected-3252-10705": Figma_kAngSWapljVFOOUAen6APm_3252_10705,
"selected-3252-10716": Figma_kAngSWapljVFOOUAen6APm_3252_10716,
"selected-3252-10724": Figma_kAngSWapljVFOOUAen6APm_3252_10724,
"selected-3252-10762": Figma_kAngSWapljVFOOUAen6APm_3252_10762,
"selected-3252-10765": Figma_kAngSWapljVFOOUAen6APm_3252_10765,
"selected-3252-10766": Figma_kAngSWapljVFOOUAen6APm_3252_10766,
"selected-3252-1176": Figma_kAngSWapljVFOOUAen6APm_3252_1176,
"selected-3252-1232": Figma_kAngSWapljVFOOUAen6APm_3252_1232,
"selected-3252-1278": Figma_kAngSWapljVFOOUAen6APm_3252_1278,
"selected-3252-1388": Figma_kAngSWapljVFOOUAen6APm_3252_1388,
"selected-3252-13929": Figma_kAngSWapljVFOOUAen6APm_3252_13929,
"selected-3252-13930": Figma_kAngSWapljVFOOUAen6APm_3252_13930,
"selected-3252-13931": Figma_kAngSWapljVFOOUAen6APm_3252_13931,
"selected-3252-13932": Figma_kAngSWapljVFOOUAen6APm_3252_13932,
"selected-3252-13947": Figma_kAngSWapljVFOOUAen6APm_3252_13947,
"selected-3252-13950": Figma_kAngSWapljVFOOUAen6APm_3252_13950,
"selected-3252-13953": Figma_kAngSWapljVFOOUAen6APm_3252_13953,
"selected-3252-13954": Figma_kAngSWapljVFOOUAen6APm_3252_13954,
"selected-3252-13955": Figma_kAngSWapljVFOOUAen6APm_3252_13955,
"selected-3252-13961": Figma_kAngSWapljVFOOUAen6APm_3252_13961,
"selected-3252-13999": Figma_kAngSWapljVFOOUAen6APm_3252_13999,
"selected-3252-14002": Figma_kAngSWapljVFOOUAen6APm_3252_14002,
"selected-3252-14003": Figma_kAngSWapljVFOOUAen6APm_3252_14003,
"selected-3252-1462": Figma_kAngSWapljVFOOUAen6APm_3252_1462,
"selected-3252-1527": Figma_kAngSWapljVFOOUAen6APm_3252_1527,
"selected-3252-1578": Figma_kAngSWapljVFOOUAen6APm_3252_1578,
"selected-3252-161": Figma_kAngSWapljVFOOUAen6APm_3252_161,
"selected-3252-17166": Figma_kAngSWapljVFOOUAen6APm_3252_17166,
"selected-3252-17167": Figma_kAngSWapljVFOOUAen6APm_3252_17167,
"selected-3252-17168": Figma_kAngSWapljVFOOUAen6APm_3252_17168,
"selected-3252-17183": Figma_kAngSWapljVFOOUAen6APm_3252_17183,
"selected-3252-17186": Figma_kAngSWapljVFOOUAen6APm_3252_17186,
"selected-3252-17189": Figma_kAngSWapljVFOOUAen6APm_3252_17189,
"selected-3252-17197": Figma_kAngSWapljVFOOUAen6APm_3252_17197,
"selected-3252-17202": Figma_kAngSWapljVFOOUAen6APm_3252_17202,
"selected-3252-17210": Figma_kAngSWapljVFOOUAen6APm_3252_17210,
"selected-3252-17248": Figma_kAngSWapljVFOOUAen6APm_3252_17248,
"selected-3252-17251": Figma_kAngSWapljVFOOUAen6APm_3252_17251,
"selected-3252-17252": Figma_kAngSWapljVFOOUAen6APm_3252_17252,
"selected-3252-1782": Figma_kAngSWapljVFOOUAen6APm_3252_1782,
"selected-3252-1832": Figma_kAngSWapljVFOOUAen6APm_3252_1832,
"selected-3252-2036": Figma_kAngSWapljVFOOUAen6APm_3252_2036,
"selected-3252-20415": Figma_kAngSWapljVFOOUAen6APm_3252_20415,
"selected-3252-20416": Figma_kAngSWapljVFOOUAen6APm_3252_20416,
"selected-3252-20417": Figma_kAngSWapljVFOOUAen6APm_3252_20417,
"selected-3252-20418": Figma_kAngSWapljVFOOUAen6APm_3252_20418,
"selected-3252-20435": Figma_kAngSWapljVFOOUAen6APm_3252_20435,
"selected-3252-20438": Figma_kAngSWapljVFOOUAen6APm_3252_20438,
"selected-3252-20441": Figma_kAngSWapljVFOOUAen6APm_3252_20441,
"selected-3252-20460": Figma_kAngSWapljVFOOUAen6APm_3252_20460,
"selected-3252-20498": Figma_kAngSWapljVFOOUAen6APm_3252_20498,
"selected-3252-20501": Figma_kAngSWapljVFOOUAen6APm_3252_20501,
"selected-3252-20502": Figma_kAngSWapljVFOOUAen6APm_3252_20502,
"selected-3252-2168": Figma_kAngSWapljVFOOUAen6APm_3252_2168,
"selected-3252-2223": Figma_kAngSWapljVFOOUAen6APm_3252_2223,
"selected-3252-2356": Figma_kAngSWapljVFOOUAen6APm_3252_2356,
"selected-3252-23665": Figma_kAngSWapljVFOOUAen6APm_3252_23665,
"selected-3252-23666": Figma_kAngSWapljVFOOUAen6APm_3252_23666,
"selected-3252-23667": Figma_kAngSWapljVFOOUAen6APm_3252_23667,
"selected-3252-23668": Figma_kAngSWapljVFOOUAen6APm_3252_23668,
"selected-3252-23683": Figma_kAngSWapljVFOOUAen6APm_3252_23683,
"selected-3252-23723": Figma_kAngSWapljVFOOUAen6APm_3252_23723,
"selected-3252-23766": Figma_kAngSWapljVFOOUAen6APm_3252_23766,
"selected-3252-23889": Figma_kAngSWapljVFOOUAen6APm_3252_23889,
"selected-3252-24012": Figma_kAngSWapljVFOOUAen6APm_3252_24012,
"selected-3252-24135": Figma_kAngSWapljVFOOUAen6APm_3252_24135,
"selected-3252-24261": Figma_kAngSWapljVFOOUAen6APm_3252_24261,
"selected-3252-24423": Figma_kAngSWapljVFOOUAen6APm_3252_24423,
"selected-3252-2473": Figma_kAngSWapljVFOOUAen6APm_3252_2473,
"selected-3252-24984": Figma_kAngSWapljVFOOUAen6APm_3252_24984,
"selected-3252-25179": Figma_kAngSWapljVFOOUAen6APm_3252_25179,
"selected-3252-25278": Figma_kAngSWapljVFOOUAen6APm_3252_25278,
"selected-3252-25348": Figma_kAngSWapljVFOOUAen6APm_3252_25348,
"selected-3252-25451": Figma_kAngSWapljVFOOUAen6APm_3252_25451,
"selected-3252-25539": Figma_kAngSWapljVFOOUAen6APm_3252_25539,
"selected-3252-25746": Figma_kAngSWapljVFOOUAen6APm_3252_25746,
"selected-3252-25806": Figma_kAngSWapljVFOOUAen6APm_3252_25806,
"selected-3252-25881": Figma_kAngSWapljVFOOUAen6APm_3252_25881,
"selected-3252-25998": Figma_kAngSWapljVFOOUAen6APm_3252_25998,
"selected-3252-26044": Figma_kAngSWapljVFOOUAen6APm_3252_26044,
"selected-3252-26105": Figma_kAngSWapljVFOOUAen6APm_3252_26105,
"selected-3252-26368": Figma_kAngSWapljVFOOUAen6APm_3252_26368,
"selected-3252-26670": Figma_kAngSWapljVFOOUAen6APm_3252_26670,
"selected-3252-26704": Figma_kAngSWapljVFOOUAen6APm_3252_26704,
"selected-3252-26774": Figma_kAngSWapljVFOOUAen6APm_3252_26774,
"selected-3252-26941": Figma_kAngSWapljVFOOUAen6APm_3252_26941,
"selected-3252-27038": Figma_kAngSWapljVFOOUAen6APm_3252_27038,
"selected-3252-2717": Figma_kAngSWapljVFOOUAen6APm_3252_2717,
"selected-3252-27232": Figma_kAngSWapljVFOOUAen6APm_3252_27232,
"selected-3252-27391": Figma_kAngSWapljVFOOUAen6APm_3252_27391,
"selected-3252-27548": Figma_kAngSWapljVFOOUAen6APm_3252_27548,
"selected-3252-27665": Figma_kAngSWapljVFOOUAen6APm_3252_27665,
"selected-3252-27723": Figma_kAngSWapljVFOOUAen6APm_3252_27723,
"selected-3252-27891": Figma_kAngSWapljVFOOUAen6APm_3252_27891,
"selected-3252-27897": Figma_kAngSWapljVFOOUAen6APm_3252_27897,
"selected-3252-284": Figma_kAngSWapljVFOOUAen6APm_3252_284,
"selected-3252-2896": Figma_kAngSWapljVFOOUAen6APm_3252_2896,
"selected-3252-31060": Figma_kAngSWapljVFOOUAen6APm_3252_31060,
"selected-3252-31062": Figma_kAngSWapljVFOOUAen6APm_3252_31062,
"selected-3252-31063": Figma_kAngSWapljVFOOUAen6APm_3252_31063,
"selected-3252-31065": Figma_kAngSWapljVFOOUAen6APm_3252_31065,
"selected-3252-31078": Figma_kAngSWapljVFOOUAen6APm_3252_31078,
"selected-3252-34241": Figma_kAngSWapljVFOOUAen6APm_3252_34241,
"selected-3252-34243": Figma_kAngSWapljVFOOUAen6APm_3252_34243,
"selected-3252-34244": Figma_kAngSWapljVFOOUAen6APm_3252_34244,
"selected-3252-34246": Figma_kAngSWapljVFOOUAen6APm_3252_34246,
"selected-3252-34257": Figma_kAngSWapljVFOOUAen6APm_3252_34257,
"selected-3252-345": Figma_kAngSWapljVFOOUAen6APm_3252_345,
"selected-3252-3523": Figma_kAngSWapljVFOOUAen6APm_3252_3523,
"selected-3252-3525": Figma_kAngSWapljVFOOUAen6APm_3252_3525,
"selected-3252-37420": Figma_kAngSWapljVFOOUAen6APm_3252_37420,
"selected-3252-37421": Figma_kAngSWapljVFOOUAen6APm_3252_37421,
"selected-3252-37423": Figma_kAngSWapljVFOOUAen6APm_3252_37423,
"selected-3252-37425": Figma_kAngSWapljVFOOUAen6APm_3252_37425,
"selected-3252-37440": Figma_kAngSWapljVFOOUAen6APm_3252_37440,
"selected-3252-3757": Figma_kAngSWapljVFOOUAen6APm_3252_3757,
"selected-3252-3758": Figma_kAngSWapljVFOOUAen6APm_3252_3758,
"selected-3252-3760": Figma_kAngSWapljVFOOUAen6APm_3252_3760,
"selected-3252-3761": Figma_kAngSWapljVFOOUAen6APm_3252_3761,
"selected-3252-3762": Figma_kAngSWapljVFOOUAen6APm_3252_3762,
"selected-3252-3763": Figma_kAngSWapljVFOOUAen6APm_3252_3763,
"selected-3252-3764": Figma_kAngSWapljVFOOUAen6APm_3252_3764,
"selected-3252-3769": Figma_kAngSWapljVFOOUAen6APm_3252_3769,
"selected-3252-4001": Figma_kAngSWapljVFOOUAen6APm_3252_4001,
"selected-3252-4002": Figma_kAngSWapljVFOOUAen6APm_3252_4002,
"selected-3252-4004": Figma_kAngSWapljVFOOUAen6APm_3252_4004,
"selected-3252-4005": Figma_kAngSWapljVFOOUAen6APm_3252_4005,
"selected-3252-4006": Figma_kAngSWapljVFOOUAen6APm_3252_4006,
"selected-3252-4007": Figma_kAngSWapljVFOOUAen6APm_3252_4007,
"selected-3252-4008": Figma_kAngSWapljVFOOUAen6APm_3252_4008,
"selected-3252-4009": Figma_kAngSWapljVFOOUAen6APm_3252_4009,
"selected-3252-40603": Figma_kAngSWapljVFOOUAen6APm_3252_40603,
"selected-3252-40605": Figma_kAngSWapljVFOOUAen6APm_3252_40605,
"selected-3252-40606": Figma_kAngSWapljVFOOUAen6APm_3252_40606,
"selected-3252-40616": Figma_kAngSWapljVFOOUAen6APm_3252_40616,
"selected-3252-40618": Figma_kAngSWapljVFOOUAen6APm_3252_40618,
"selected-3252-40648": Figma_kAngSWapljVFOOUAen6APm_3252_40648,
"selected-3252-40658": Figma_kAngSWapljVFOOUAen6APm_3252_40658,
"selected-3252-40663": Figma_kAngSWapljVFOOUAen6APm_3252_40663,
"selected-3252-40692": Figma_kAngSWapljVFOOUAen6APm_3252_40692,
"selected-3252-40713": Figma_kAngSWapljVFOOUAen6APm_3252_40713,
"selected-3252-40822": Figma_kAngSWapljVFOOUAen6APm_3252_40822,
"selected-3252-40901": Figma_kAngSWapljVFOOUAen6APm_3252_40901,
"selected-3252-40988": Figma_kAngSWapljVFOOUAen6APm_3252_40988,
"selected-3252-41041": Figma_kAngSWapljVFOOUAen6APm_3252_41041,
"selected-3252-41046": Figma_kAngSWapljVFOOUAen6APm_3252_41046,
"selected-3252-41104": Figma_kAngSWapljVFOOUAen6APm_3252_41104,
"selected-3252-41140": Figma_kAngSWapljVFOOUAen6APm_3252_41140,
"selected-3252-41218": Figma_kAngSWapljVFOOUAen6APm_3252_41218,
"selected-3252-41318": Figma_kAngSWapljVFOOUAen6APm_3252_41318,
"selected-3252-41323": Figma_kAngSWapljVFOOUAen6APm_3252_41323,
"selected-3252-41371": Figma_kAngSWapljVFOOUAen6APm_3252_41371,
"selected-3252-41402": Figma_kAngSWapljVFOOUAen6APm_3252_41402,
"selected-3252-41408": Figma_kAngSWapljVFOOUAen6APm_3252_41408,
"selected-3252-41443": Figma_kAngSWapljVFOOUAen6APm_3252_41443,
"selected-3252-41490": Figma_kAngSWapljVFOOUAen6APm_3252_41490,
"selected-3252-415": Figma_kAngSWapljVFOOUAen6APm_3252_415,
"selected-3252-41525": Figma_kAngSWapljVFOOUAen6APm_3252_41525,
"selected-3252-41627": Figma_kAngSWapljVFOOUAen6APm_3252_41627,
"selected-3252-41647": Figma_kAngSWapljVFOOUAen6APm_3252_41647,
"selected-3252-41718": Figma_kAngSWapljVFOOUAen6APm_3252_41718,
"selected-3252-41725": Figma_kAngSWapljVFOOUAen6APm_3252_41725,
"selected-3252-41795": Figma_kAngSWapljVFOOUAen6APm_3252_41795,
"selected-3252-41834": Figma_kAngSWapljVFOOUAen6APm_3252_41834,
"selected-3252-41868": Figma_kAngSWapljVFOOUAen6APm_3252_41868,
"selected-3252-4241": Figma_kAngSWapljVFOOUAen6APm_3252_4241,
"selected-3252-4242": Figma_kAngSWapljVFOOUAen6APm_3252_4242,
"selected-3252-4244": Figma_kAngSWapljVFOOUAen6APm_3252_4244,
"selected-3252-4245": Figma_kAngSWapljVFOOUAen6APm_3252_4245,
"selected-3252-4246": Figma_kAngSWapljVFOOUAen6APm_3252_4246,
"selected-3252-4247": Figma_kAngSWapljVFOOUAen6APm_3252_4247,
"selected-3252-4248": Figma_kAngSWapljVFOOUAen6APm_3252_4248,
"selected-3252-4249": Figma_kAngSWapljVFOOUAen6APm_3252_4249,
"selected-3252-43633": Figma_kAngSWapljVFOOUAen6APm_3252_43633,
"selected-3252-43636": Figma_kAngSWapljVFOOUAen6APm_3252_43636,
"selected-3252-43637": Figma_kAngSWapljVFOOUAen6APm_3252_43637,
"selected-3252-43638": Figma_kAngSWapljVFOOUAen6APm_3252_43638,
"selected-3252-43639": Figma_kAngSWapljVFOOUAen6APm_3252_43639,
"selected-3252-43659": Figma_kAngSWapljVFOOUAen6APm_3252_43659,
"selected-3252-43673": Figma_kAngSWapljVFOOUAen6APm_3252_43673,
"selected-3252-43675": Figma_kAngSWapljVFOOUAen6APm_3252_43675,
"selected-3252-4488": Figma_kAngSWapljVFOOUAen6APm_3252_4488,
"selected-3252-4489": Figma_kAngSWapljVFOOUAen6APm_3252_4489,
"selected-3252-4492": Figma_kAngSWapljVFOOUAen6APm_3252_4492,
"selected-3252-4493": Figma_kAngSWapljVFOOUAen6APm_3252_4493,
"selected-3252-4499": Figma_kAngSWapljVFOOUAen6APm_3252_4499,
"selected-3252-4516": Figma_kAngSWapljVFOOUAen6APm_3252_4516,
"selected-3252-4517": Figma_kAngSWapljVFOOUAen6APm_3252_4517,
"selected-3252-4518": Figma_kAngSWapljVFOOUAen6APm_3252_4518,
"selected-3252-4519": Figma_kAngSWapljVFOOUAen6APm_3252_4519,
"selected-3252-4522": Figma_kAngSWapljVFOOUAen6APm_3252_4522,
"selected-3252-4523": Figma_kAngSWapljVFOOUAen6APm_3252_4523,
"selected-3252-4524": Figma_kAngSWapljVFOOUAen6APm_3252_4524,
"selected-3252-4525": Figma_kAngSWapljVFOOUAen6APm_3252_4525,
"selected-3252-4529": Figma_kAngSWapljVFOOUAen6APm_3252_4529,
"selected-3252-4582": Figma_kAngSWapljVFOOUAen6APm_3252_4582,
"selected-3252-4641": Figma_kAngSWapljVFOOUAen6APm_3252_4641,
"selected-3252-46852": Figma_kAngSWapljVFOOUAen6APm_3252_46852,
"selected-3252-46853": Figma_kAngSWapljVFOOUAen6APm_3252_46853,
"selected-3252-46854": Figma_kAngSWapljVFOOUAen6APm_3252_46854,
"selected-3252-46865": Figma_kAngSWapljVFOOUAen6APm_3252_46865,
"selected-3252-46868": Figma_kAngSWapljVFOOUAen6APm_3252_46868,
"selected-3252-46877": Figma_kAngSWapljVFOOUAen6APm_3252_46877,
"selected-3252-46880": Figma_kAngSWapljVFOOUAen6APm_3252_46880,
"selected-3252-4705": Figma_kAngSWapljVFOOUAen6APm_3252_4705,
"selected-3252-4772": Figma_kAngSWapljVFOOUAen6APm_3252_4772,
"selected-3252-482": Figma_kAngSWapljVFOOUAen6APm_3252_482,
"selected-3252-4842": Figma_kAngSWapljVFOOUAen6APm_3252_4842,
"selected-3252-4909": Figma_kAngSWapljVFOOUAen6APm_3252_4909,
"selected-3252-50046": Figma_kAngSWapljVFOOUAen6APm_3252_50046,
"selected-3252-50047": Figma_kAngSWapljVFOOUAen6APm_3252_50047,
"selected-3252-50048": Figma_kAngSWapljVFOOUAen6APm_3252_50048,
"selected-3252-50055": Figma_kAngSWapljVFOOUAen6APm_3252_50055,
"selected-3252-5024": Figma_kAngSWapljVFOOUAen6APm_3252_5024,
"selected-3252-5081": Figma_kAngSWapljVFOOUAen6APm_3252_5081,
"selected-3252-5142": Figma_kAngSWapljVFOOUAen6APm_3252_5142,
"selected-3252-5201": Figma_kAngSWapljVFOOUAen6APm_3252_5201,
"selected-3252-5265": Figma_kAngSWapljVFOOUAen6APm_3252_5265,
"selected-3252-53236": Figma_kAngSWapljVFOOUAen6APm_3252_53236,
"selected-3252-53239": Figma_kAngSWapljVFOOUAen6APm_3252_53239,
"selected-3252-53242": Figma_kAngSWapljVFOOUAen6APm_3252_53242,
"selected-3252-5332": Figma_kAngSWapljVFOOUAen6APm_3252_5332,
"selected-3252-5402": Figma_kAngSWapljVFOOUAen6APm_3252_5402,
"selected-3252-5466": Figma_kAngSWapljVFOOUAen6APm_3252_5466,
"selected-3252-5543": Figma_kAngSWapljVFOOUAen6APm_3252_5543,
"selected-3252-5604": Figma_kAngSWapljVFOOUAen6APm_3252_5604,
"selected-3252-563": Figma_kAngSWapljVFOOUAen6APm_3252_563,
"selected-3252-56425": Figma_kAngSWapljVFOOUAen6APm_3252_56425,
"selected-3252-5766": Figma_kAngSWapljVFOOUAen6APm_3252_5766,
"selected-3252-59604": Figma_kAngSWapljVFOOUAen6APm_3252_59604,
"selected-3252-59606": Figma_kAngSWapljVFOOUAen6APm_3252_59606,
"selected-3252-62783": Figma_kAngSWapljVFOOUAen6APm_3252_62783,
"selected-3252-62784": Figma_kAngSWapljVFOOUAen6APm_3252_62784,
"selected-3252-62785": Figma_kAngSWapljVFOOUAen6APm_3252_62785,
"selected-3252-62794": Figma_kAngSWapljVFOOUAen6APm_3252_62794,
"selected-3252-62797": Figma_kAngSWapljVFOOUAen6APm_3252_62797,
"selected-3252-62800": Figma_kAngSWapljVFOOUAen6APm_3252_62800,
"selected-3252-62812": Figma_kAngSWapljVFOOUAen6APm_3252_62812,
"selected-3252-6327": Figma_kAngSWapljVFOOUAen6APm_3252_6327,
"selected-3252-635": Figma_kAngSWapljVFOOUAen6APm_3252_635,
"selected-3252-6524": Figma_kAngSWapljVFOOUAen6APm_3252_6524,
"selected-3252-65996": Figma_kAngSWapljVFOOUAen6APm_3252_65996,
"selected-3252-6623": Figma_kAngSWapljVFOOUAen6APm_3252_6623,
"selected-3252-6693": Figma_kAngSWapljVFOOUAen6APm_3252_6693,
"selected-3252-6796": Figma_kAngSWapljVFOOUAen6APm_3252_6796,
"selected-3252-685": Figma_kAngSWapljVFOOUAen6APm_3252_685,
"selected-3252-6881": Figma_kAngSWapljVFOOUAen6APm_3252_6881,
"selected-3252-69175": Figma_kAngSWapljVFOOUAen6APm_3252_69175,
"selected-3252-69177": Figma_kAngSWapljVFOOUAen6APm_3252_69177,
"selected-3252-6969": Figma_kAngSWapljVFOOUAen6APm_3252_6969,
"selected-3252-7103": Figma_kAngSWapljVFOOUAen6APm_3252_7103,
"selected-3252-72343": Figma_kAngSWapljVFOOUAen6APm_3252_72343,
"selected-3252-72344": Figma_kAngSWapljVFOOUAen6APm_3252_72344,
"selected-3252-72349": Figma_kAngSWapljVFOOUAen6APm_3252_72349,
"selected-3252-7239": Figma_kAngSWapljVFOOUAen6APm_3252_7239,
"selected-3252-72402": Figma_kAngSWapljVFOOUAen6APm_3252_72402,
"selected-3252-72490": Figma_kAngSWapljVFOOUAen6APm_3252_72490,
"selected-3252-72531": Figma_kAngSWapljVFOOUAen6APm_3252_72531,
"selected-3252-72592": Figma_kAngSWapljVFOOUAen6APm_3252_72592,
"selected-3252-72662": Figma_kAngSWapljVFOOUAen6APm_3252_72662,
"selected-3252-72715": Figma_kAngSWapljVFOOUAen6APm_3252_72715,
"selected-3252-72759": Figma_kAngSWapljVFOOUAen6APm_3252_72759,
"selected-3252-72805": Figma_kAngSWapljVFOOUAen6APm_3252_72805,
"selected-3252-72829": Figma_kAngSWapljVFOOUAen6APm_3252_72829,
"selected-3252-72861": Figma_kAngSWapljVFOOUAen6APm_3252_72861,
"selected-3252-72881": Figma_kAngSWapljVFOOUAen6APm_3252_72881,
"selected-3252-73010": Figma_kAngSWapljVFOOUAen6APm_3252_73010,
"selected-3252-73033": Figma_kAngSWapljVFOOUAen6APm_3252_73033,
"selected-3252-73101": Figma_kAngSWapljVFOOUAen6APm_3252_73101,
"selected-3252-73123": Figma_kAngSWapljVFOOUAen6APm_3252_73123,
"selected-3252-73224": Figma_kAngSWapljVFOOUAen6APm_3252_73224,
"selected-3252-73303": Figma_kAngSWapljVFOOUAen6APm_3252_73303,
"selected-3252-73323": Figma_kAngSWapljVFOOUAen6APm_3252_73323,
"selected-3252-73390": Figma_kAngSWapljVFOOUAen6APm_3252_73390,
"selected-3252-73395": Figma_kAngSWapljVFOOUAen6APm_3252_73395,
"selected-3252-7342": Figma_kAngSWapljVFOOUAen6APm_3252_7342,
"selected-3252-73464": Figma_kAngSWapljVFOOUAen6APm_3252_73464,
"selected-3252-73474": Figma_kAngSWapljVFOOUAen6APm_3252_73474,
"selected-3252-73503": Figma_kAngSWapljVFOOUAen6APm_3252_73503,
"selected-3252-73508": Figma_kAngSWapljVFOOUAen6APm_3252_73508,
"selected-3252-73542": Figma_kAngSWapljVFOOUAen6APm_3252_73542,
"selected-3252-73572": Figma_kAngSWapljVFOOUAen6APm_3252_73572,
"selected-3252-73653": Figma_kAngSWapljVFOOUAen6APm_3252_73653,
"selected-3252-73704": Figma_kAngSWapljVFOOUAen6APm_3252_73704,
"selected-3252-73707": Figma_kAngSWapljVFOOUAen6APm_3252_73707,
"selected-3252-73735": Figma_kAngSWapljVFOOUAen6APm_3252_73735,
"selected-3252-73750": Figma_kAngSWapljVFOOUAen6APm_3252_73750,
"selected-3252-73799": Figma_kAngSWapljVFOOUAen6APm_3252_73799,
"selected-3252-73894": Figma_kAngSWapljVFOOUAen6APm_3252_73894,
"selected-3252-73984": Figma_kAngSWapljVFOOUAen6APm_3252_73984,
"selected-3252-74089": Figma_kAngSWapljVFOOUAen6APm_3252_74089,
"selected-3252-74197": Figma_kAngSWapljVFOOUAen6APm_3252_74197,
"selected-3252-74302": Figma_kAngSWapljVFOOUAen6APm_3252_74302,
"selected-3252-74398": Figma_kAngSWapljVFOOUAen6APm_3252_74398,
"selected-3252-74467": Figma_kAngSWapljVFOOUAen6APm_3252_74467,
"selected-3252-74596": Figma_kAngSWapljVFOOUAen6APm_3252_74596,
"selected-3252-746": Figma_kAngSWapljVFOOUAen6APm_3252_746,
"selected-3252-74616": Figma_kAngSWapljVFOOUAen6APm_3252_74616,
"selected-3252-74622": Figma_kAngSWapljVFOOUAen6APm_3252_74622,
"selected-3252-74629": Figma_kAngSWapljVFOOUAen6APm_3252_74629,
"selected-3252-74640": Figma_kAngSWapljVFOOUAen6APm_3252_74640,
"selected-3252-74647": Figma_kAngSWapljVFOOUAen6APm_3252_74647,
"selected-3252-74663": Figma_kAngSWapljVFOOUAen6APm_3252_74663,
"selected-3252-74671": Figma_kAngSWapljVFOOUAen6APm_3252_74671,
"selected-3252-74684": Figma_kAngSWapljVFOOUAen6APm_3252_74684,
"selected-3252-74701": Figma_kAngSWapljVFOOUAen6APm_3252_74701,
"selected-3252-74743": Figma_kAngSWapljVFOOUAen6APm_3252_74743,
"selected-3252-74753": Figma_kAngSWapljVFOOUAen6APm_3252_74753,
"selected-3252-74875": Figma_kAngSWapljVFOOUAen6APm_3252_74875,
"selected-3252-74933": Figma_kAngSWapljVFOOUAen6APm_3252_74933,
"selected-3252-74935": Figma_kAngSWapljVFOOUAen6APm_3252_74935,
"selected-3252-75014": Figma_kAngSWapljVFOOUAen6APm_3252_75014,
"selected-3252-75052": Figma_kAngSWapljVFOOUAen6APm_3252_75052,
"selected-3252-75058": Figma_kAngSWapljVFOOUAen6APm_3252_75058,
"selected-3252-75134": Figma_kAngSWapljVFOOUAen6APm_3252_75134,
"selected-3252-75166": Figma_kAngSWapljVFOOUAen6APm_3252_75166,
"selected-3252-75172": Figma_kAngSWapljVFOOUAen6APm_3252_75172,
"selected-3252-75269": Figma_kAngSWapljVFOOUAen6APm_3252_75269,
"selected-3252-75325": Figma_kAngSWapljVFOOUAen6APm_3252_75325,
"selected-3252-75363": Figma_kAngSWapljVFOOUAen6APm_3252_75363,
"selected-3252-75383": Figma_kAngSWapljVFOOUAen6APm_3252_75383,
"selected-3252-75499": Figma_kAngSWapljVFOOUAen6APm_3252_75499,
"selected-3252-75522": Figma_kAngSWapljVFOOUAen6APm_3252_75522,
"selected-3252-75640": Figma_kAngSWapljVFOOUAen6APm_3252_75640,
"selected-3252-75665": Figma_kAngSWapljVFOOUAen6APm_3252_75665,
"selected-3252-75787": Figma_kAngSWapljVFOOUAen6APm_3252_75787,
"selected-3252-75808": Figma_kAngSWapljVFOOUAen6APm_3252_75808,
"selected-3252-7591": Figma_kAngSWapljVFOOUAen6APm_3252_7591,
"selected-3252-75922": Figma_kAngSWapljVFOOUAen6APm_3252_75922,
"selected-3252-75945": Figma_kAngSWapljVFOOUAen6APm_3252_75945,
"selected-3252-76085": Figma_kAngSWapljVFOOUAen6APm_3252_76085,
"selected-3252-76134": Figma_kAngSWapljVFOOUAen6APm_3252_76134,
"selected-3252-76143": Figma_kAngSWapljVFOOUAen6APm_3252_76143,
"selected-3252-76482": Figma_kAngSWapljVFOOUAen6APm_3252_76482,
"selected-3252-76488": Figma_kAngSWapljVFOOUAen6APm_3252_76488,
"selected-3252-76497": Figma_kAngSWapljVFOOUAen6APm_3252_76497,
"selected-3252-76529": Figma_kAngSWapljVFOOUAen6APm_3252_76529,
"selected-3252-76545": Figma_kAngSWapljVFOOUAen6APm_3252_76545,
"selected-3252-76548": Figma_kAngSWapljVFOOUAen6APm_3252_76548,
"selected-3252-76549": Figma_kAngSWapljVFOOUAen6APm_3252_76549,
"selected-3252-76551": Figma_kAngSWapljVFOOUAen6APm_3252_76551,
"selected-3252-76553": Figma_kAngSWapljVFOOUAen6APm_3252_76553,
"selected-3252-7660": Figma_kAngSWapljVFOOUAen6APm_3252_7660,
"selected-3252-76654": Figma_kAngSWapljVFOOUAen6APm_3252_76654,
"selected-3252-7827": Figma_kAngSWapljVFOOUAen6APm_3252_7827,
"selected-3252-7886": Figma_kAngSWapljVFOOUAen6APm_3252_7886,
"selected-3252-7971": Figma_kAngSWapljVFOOUAen6APm_3252_7971,
"selected-3252-79817": Figma_kAngSWapljVFOOUAen6APm_3252_79817,
"selected-3252-79818": Figma_kAngSWapljVFOOUAen6APm_3252_79818,
"selected-3252-79835": Figma_kAngSWapljVFOOUAen6APm_3252_79835,
"selected-3252-80001": Figma_kAngSWapljVFOOUAen6APm_3252_80001,
"selected-3252-80120": Figma_kAngSWapljVFOOUAen6APm_3252_80120,
"selected-3252-80203": Figma_kAngSWapljVFOOUAen6APm_3252_80203,
"selected-3252-80286": Figma_kAngSWapljVFOOUAen6APm_3252_80286,
"selected-3252-80331": Figma_kAngSWapljVFOOUAen6APm_3252_80331,
"selected-3252-80334": Figma_kAngSWapljVFOOUAen6APm_3252_80334,
"selected-3252-80395": Figma_kAngSWapljVFOOUAen6APm_3252_80395,
"selected-3252-80506": Figma_kAngSWapljVFOOUAen6APm_3252_80506,
"selected-3252-80507": Figma_kAngSWapljVFOOUAen6APm_3252_80507,
"selected-3252-80566": Figma_kAngSWapljVFOOUAen6APm_3252_80566,
"selected-3252-80615": Figma_kAngSWapljVFOOUAen6APm_3252_80615,
"selected-3252-80679": Figma_kAngSWapljVFOOUAen6APm_3252_80679,
"selected-3252-8068": Figma_kAngSWapljVFOOUAen6APm_3252_8068,
"selected-3252-80789": Figma_kAngSWapljVFOOUAen6APm_3252_80789,
"selected-3252-80899": Figma_kAngSWapljVFOOUAen6APm_3252_80899,
"selected-3252-81073": Figma_kAngSWapljVFOOUAen6APm_3252_81073,
"selected-3252-81182": Figma_kAngSWapljVFOOUAen6APm_3252_81182,
"selected-3252-81357": Figma_kAngSWapljVFOOUAen6APm_3252_81357,
"selected-3252-82010": Figma_kAngSWapljVFOOUAen6APm_3252_82010,
"selected-3252-82140": Figma_kAngSWapljVFOOUAen6APm_3252_82140,
"selected-3252-82267": Figma_kAngSWapljVFOOUAen6APm_3252_82267,
"selected-3252-82374": Figma_kAngSWapljVFOOUAen6APm_3252_82374,
"selected-3252-82377": Figma_kAngSWapljVFOOUAen6APm_3252_82377,
"selected-3252-8317": Figma_kAngSWapljVFOOUAen6APm_3252_8317,
"selected-3252-8524": Figma_kAngSWapljVFOOUAen6APm_3252_8524,
"selected-3252-85558": Figma_kAngSWapljVFOOUAen6APm_3252_85558,
"selected-3252-8589": Figma_kAngSWapljVFOOUAen6APm_3252_8589,
"selected-3252-88737": Figma_kAngSWapljVFOOUAen6APm_3252_88737,
"selected-3252-88739": Figma_kAngSWapljVFOOUAen6APm_3252_88739,
"selected-3252-9132": Figma_kAngSWapljVFOOUAen6APm_3252_9132,
"selected-3252-91905": Figma_kAngSWapljVFOOUAen6APm_3252_91905,
"selected-3252-91906": Figma_kAngSWapljVFOOUAen6APm_3252_91906,
"selected-3252-91907": Figma_kAngSWapljVFOOUAen6APm_3252_91907,
"selected-3252-91911": Figma_kAngSWapljVFOOUAen6APm_3252_91911,
"selected-3252-91953": Figma_kAngSWapljVFOOUAen6APm_3252_91953,
"selected-3252-92104": Figma_kAngSWapljVFOOUAen6APm_3252_92104,
"selected-3252-92105": Figma_kAngSWapljVFOOUAen6APm_3252_92105,
"selected-3252-92169": Figma_kAngSWapljVFOOUAen6APm_3252_92169,
"selected-3252-92420": Figma_kAngSWapljVFOOUAen6APm_3252_92420,
"selected-3252-92556": Figma_kAngSWapljVFOOUAen6APm_3252_92556,
"selected-3252-92560": Figma_kAngSWapljVFOOUAen6APm_3252_92560,
"selected-3252-92589": Figma_kAngSWapljVFOOUAen6APm_3252_92589,
"selected-3252-92613": Figma_kAngSWapljVFOOUAen6APm_3252_92613,
"selected-3252-92706": Figma_kAngSWapljVFOOUAen6APm_3252_92706,
"selected-3252-92716": Figma_kAngSWapljVFOOUAen6APm_3252_92716,
"selected-3252-92836": Figma_kAngSWapljVFOOUAen6APm_3252_92836,
"selected-3252-92963": Figma_kAngSWapljVFOOUAen6APm_3252_92963,
"selected-3252-92974": Figma_kAngSWapljVFOOUAen6APm_3252_92974,
"selected-3252-93066": Figma_kAngSWapljVFOOUAen6APm_3252_93066,
"selected-3252-93131": Figma_kAngSWapljVFOOUAen6APm_3252_93131,
"selected-3252-93216": Figma_kAngSWapljVFOOUAen6APm_3252_93216,
"selected-3252-93394": Figma_kAngSWapljVFOOUAen6APm_3252_93394,
"selected-3252-93395": Figma_kAngSWapljVFOOUAen6APm_3252_93395,
"selected-3252-93497": Figma_kAngSWapljVFOOUAen6APm_3252_93497,
"selected-3252-93626": Figma_kAngSWapljVFOOUAen6APm_3252_93626,
"selected-3252-9367": Figma_kAngSWapljVFOOUAen6APm_3252_9367,
"selected-3252-93735": Figma_kAngSWapljVFOOUAen6APm_3252_93735,
"selected-3252-93808": Figma_kAngSWapljVFOOUAen6APm_3252_93808,
"selected-3252-93832": Figma_kAngSWapljVFOOUAen6APm_3252_93832,
"selected-3252-93864": Figma_kAngSWapljVFOOUAen6APm_3252_93864,
"selected-3252-93877": Figma_kAngSWapljVFOOUAen6APm_3252_93877,
"selected-3252-93951": Figma_kAngSWapljVFOOUAen6APm_3252_93951,
"selected-3252-93953": Figma_kAngSWapljVFOOUAen6APm_3252_93953,
"selected-3252-94056": Figma_kAngSWapljVFOOUAen6APm_3252_94056,
"selected-3252-94059": Figma_kAngSWapljVFOOUAen6APm_3252_94059,
"selected-3252-94102": Figma_kAngSWapljVFOOUAen6APm_3252_94102,
"selected-3252-94179": Figma_kAngSWapljVFOOUAen6APm_3252_94179,
"selected-3252-94224": Figma_kAngSWapljVFOOUAen6APm_3252_94224,
"selected-3252-94233": Figma_kAngSWapljVFOOUAen6APm_3252_94233,
"selected-3252-94241": Figma_kAngSWapljVFOOUAen6APm_3252_94241,
"selected-3252-94245": Figma_kAngSWapljVFOOUAen6APm_3252_94245,
"selected-3252-94268": Figma_kAngSWapljVFOOUAen6APm_3252_94268,
"selected-3252-94313": Figma_kAngSWapljVFOOUAen6APm_3252_94313,
"selected-3252-9481": Figma_kAngSWapljVFOOUAen6APm_3252_9481,
"selected-3252-9605": Figma_kAngSWapljVFOOUAen6APm_3252_9605,
"selected-3252-9676": Figma_kAngSWapljVFOOUAen6APm_3252_9676,
"selected-3252-9720": Figma_kAngSWapljVFOOUAen6APm_3252_9720,
"selected-3252-9844": Figma_kAngSWapljVFOOUAen6APm_3252_9844,
"selected-3252-9931": Figma_kAngSWapljVFOOUAen6APm_3252_9931,
"selected-3252-9990": Figma_kAngSWapljVFOOUAen6APm_3252_9990,
"selected-3252-73135": NativePart_3252_73135,
"selected-3252-73192": NativePart_3252_73192,
"selected-3252-72984": NativePart_3252_72984,
"selected-3252-73023": NativePart_3252_73023,
"selected-3252-73260": NativePart_3252_73260,
};
type AssemblyChild={nodeId?:string;fileKey?:string;componentId?:string;src?:string;x:number;y:number;width:number;height:number;opacity?:number;rotation?:number;transformMatrix?:[number,number,number,number];maskSrc?:string;clip?:boolean;borderRadius?:number;backgroundColor?:string;effects?:FigmaEffect[];children?:AssemblyChild[]};
type Assembly={id:string;nodeId:string;fileKey:string;width:number;height:number;clip?:boolean;borderRadius?:number;opacity?:number;backgroundColor?:string;children:AssemblyChild[]};
const assemblies=assemblyData as Assembly[];
export function FigmaIllustration({id,props,data,internalMotion,frame=0,durationFrames=1800}: {id:string;props?:ComponentProps;data?:EmbeddedInput;internalMotion?:InternalMotionTrack[];frame?:number;durationFrames?:number}) {
 const scopeId=useId().replace(/[^a-zA-Z0-9_-]/g,"");
 const validated=validateComponentProps(contracts,id,props);
 const tracks=validateInternalMotion(contracts,id,internalMotion,durationFrames,validated);
 const motionBindings=tracks.length?createInternalMotionBindings(contracts,id,tracks,frame):undefined;
 const bindings=Object.keys(validated).length?createEditableBindings(contracts,id,validated):new Map();
 const nativeInput=validateEmbeddedData(embeddedRegistry,id,data,durationFrames,validated,tracks,contracts.components[id]);
 const embeddedInstances=resolveEmbeddedInstances(embeddedRegistry,id,nativeInput,frame,durationFrames,scopeId);
 return <EditableArtworkProvider bindings={bindings} motionBindings={motionBindings} embeddedInstances={embeddedInstances}><FigmaIllustrationContent id={id} /></EditableArtworkProvider>;
}
function FigmaIllustrationContent({id}: {id:string}) {
 const Component=components[id];
 if(Component){
  const item=metadata.find(m=>m.id===id)!;
  return <div style={{position:"relative",width:"100%",height:"100%"}}><div style={{position:"absolute",width:item.coordinateCanvas.width,height:item.coordinateCanvas.height,left:-item.coordinateOffset.x,top:-item.coordinateOffset.y}}><FigmaPreload sources={resources[id]||[]} /><Component /></div></div>;
 }
 const assembly=assemblies.find(a=>a.id===id);
 if(!assembly)throw new Error(`Unknown Figma illustration: ${id}`);
 return <div data-node-id={assembly.nodeId} style={{position:"relative",width:"100%",height:"100%",overflow:assembly.clip?"hidden":undefined,borderRadius:assembly.borderRadius,opacity:assembly.opacity,backgroundColor:assembly.backgroundColor}}>
  {assembly.children.map((child,index)=><AssemblyLayer key={index} child={child} />)}
 </div>;
}
function AssemblyLayer({child}: {child:AssemblyChild}) {
 const childId=child.componentId || (child.nodeId ? metadata.find(m=>m.nodeId===child.nodeId&&m.fileKey===child.fileKey)?.id : undefined);
 if(!child.src&&!childId&&!child.children)throw new Error(`Missing assembly child ${child.nodeId}`);
 const style:CSSProperties={position:"absolute",left:child.x,top:child.y,width:child.width,height:child.height,opacity:child.opacity,transform:child.transformMatrix?`matrix(${child.transformMatrix.join(",")},0,0)`:child.rotation?`rotate(${child.rotation}deg)`:undefined,transformOrigin:"0 0",maskImage:child.maskSrc?`url("${staticFile(child.maskSrc)}")`:undefined,maskRepeat:"no-repeat"};
 const content=<div style={{position:"relative",width:"100%",height:"100%",overflow:child.clip?"hidden":undefined,borderRadius:child.borderRadius,backgroundColor:child.backgroundColor}}>
  {child.maskSrc ? <FigmaPreload sources={[child.maskSrc]} /> : null}
  {child.src ? <FigmaImage src={staticFile(child.src)} style={{width:"100%",height:"100%"}} /> : child.children ? child.children.map((nested,index)=><AssemblyLayer key={index} child={nested} />) : <FigmaIllustrationContent id={childId!} />}
 </div>;
 return child.effects?.length?<FigmaEffects effects={child.effects} style={style}>{content}</FigmaEffects>:<div style={style}>{content}</div>;
}

