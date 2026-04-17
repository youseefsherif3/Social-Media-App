"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagEnum = exports.ProviderEnum = exports.RoleEnum = exports.GenderEnum = void 0;
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "Male";
    GenderEnum["female"] = "Female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
    RoleEnum["superAdmin"] = "superAdmin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum["local"] = "local";
    ProviderEnum["google"] = "google";
})(ProviderEnum || (exports.ProviderEnum = ProviderEnum = {}));
var FlagEnum;
(function (FlagEnum) {
    FlagEnum["allDevices"] = "allDevices";
    FlagEnum["currentDevice"] = "currentDevice";
})(FlagEnum || (exports.FlagEnum = FlagEnum = {}));
;
